-- Pagamenti (Stripe): crediti, abbonamento, uso equo — Elly
--
-- Come funziona, in breve:
--  * "user_billing": saldo dei viaggi acquistati (crediti), viaggi gratuiti usati, cliente Stripe.
--  * "subscriptions": abbonamento mensile (aggiornato dal webhook di Stripe).
--  * "generation_log": ogni nuovo viaggio "completo" consumato (da abbonamento, credito o gratuito)
--    e quante modifiche ha fatto su quel viaggio. Serve all'uso equo e ai rimborsi tecnici.
--  * "credit_ledger": registro degli acquisti di crediti (un acquisto Stripe = una riga, mai doppia).
--  * "billing_settings": i limiti dell'uso equo, modificabili senza toccare il codice.
--
-- SICUREZZA: tutte le funzioni che modificano crediti/abbonamenti sono eseguibili SOLO dal server
-- (chiave "service_role"). Dal browser gli utenti possono solo LEGGERE le proprie righe.
-- Eseguire una volta nell'editor SQL di Supabase (dopo account_deletion.sql).

-- 1) Limiti dell'uso equo (una sola riga) ------------------------------------------------------
CREATE TABLE IF NOT EXISTS billing_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  free_trips INTEGER NOT NULL DEFAULT 1,             -- viaggi completi gratuiti alla registrazione
  monthly_trips INTEGER NOT NULL DEFAULT 15,         -- nuovi viaggi per periodo di abbonamento
  daily_trips INTEGER NOT NULL DEFAULT 5,            -- nuovi viaggi al giorno con abbonamento
  refinements_per_trip INTEGER NOT NULL DEFAULT 30   -- modifiche per viaggio (tetto antiabuso)
);
INSERT INTO billing_settings DEFAULT VALUES ON CONFLICT DO NOTHING;

-- 2) Tabelle ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_billing (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  free_trips_used INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,                              -- active, trialing, past_due, canceled...
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT 'purchase',
  stripe_ref TEXT UNIQUE,                            -- id della sessione di pagamento: evita accrediti doppi
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generation_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('subscription', 'credit', 'free')),
  refinements INTEGER NOT NULL DEFAULT 0,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_generation_log_user_date ON generation_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_log_trip ON generation_log (trip_id);

-- 3) Lettura: ognuno vede solo le proprie righe; nessuna scrittura dal browser --------------------
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "billing_settings_select" ON billing_settings;
CREATE POLICY "billing_settings_select" ON billing_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "billing_settings_admin_update" ON billing_settings;
CREATE POLICY "billing_settings_admin_update" ON billing_settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin));
DROP POLICY IF EXISTS "user_billing_select_own" ON user_billing;
CREATE POLICY "user_billing_select_own" ON user_billing FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "credit_ledger_select_own" ON credit_ledger;
CREATE POLICY "credit_ledger_select_own" ON credit_ledger FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "generation_log_select_own" ON generation_log;
CREATE POLICY "generation_log_select_own" ON generation_log FOR SELECT USING (auth.uid() = user_id);

-- 4) Funzioni (solo server) -----------------------------------------------------------------------

-- Consuma un nuovo viaggio completo. Ordine: abbonamento -> viaggio gratuito -> credito.
-- Restituisce {source: subscription|free|credit|none, log_id, reason}.
CREATE OR REPLACE FUNCTION consume_generation(p_user UUID) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s billing_settings%ROWTYPE;
  b user_billing%ROWTYPE;
  sb subscriptions%ROWTYPE;
  v_used_month INTEGER;
  v_used_day INTEGER;
  v_log BIGINT;
  v_reason TEXT := 'none';
  v_day_start TIMESTAMPTZ := date_trunc('day', NOW() AT TIME ZONE 'Europe/Rome') AT TIME ZONE 'Europe/Rome';
BEGIN
  SELECT * INTO s FROM billing_settings LIMIT 1;
  INSERT INTO user_billing (user_id) VALUES (p_user) ON CONFLICT DO NOTHING;
  SELECT * INTO b FROM user_billing WHERE user_id = p_user FOR UPDATE;   -- serializza le richieste dello stesso utente
  SELECT * INTO sb FROM subscriptions WHERE user_id = p_user;

  IF FOUND AND sb.status IN ('active', 'trialing') AND sb.current_period_end > NOW() THEN
    SELECT count(*) INTO v_used_month FROM generation_log
     WHERE user_id = p_user AND source = 'subscription' AND refunded_at IS NULL
       AND created_at >= COALESCE(sb.current_period_start, NOW() - INTERVAL '31 days');
    SELECT count(*) INTO v_used_day FROM generation_log
     WHERE user_id = p_user AND source = 'subscription' AND refunded_at IS NULL AND created_at >= v_day_start;
    IF v_used_day >= s.daily_trips THEN
      RETURN jsonb_build_object('source', 'none', 'reason', 'limit_day');
    ELSIF v_used_month >= s.monthly_trips THEN
      v_reason := 'limit_month';                     -- può ancora usare viaggio gratuito o crediti
    ELSE
      INSERT INTO generation_log (user_id, source) VALUES (p_user, 'subscription') RETURNING id INTO v_log;
      RETURN jsonb_build_object('source', 'subscription', 'log_id', v_log);
    END IF;
  END IF;

  IF b.free_trips_used < s.free_trips THEN
    UPDATE user_billing SET free_trips_used = free_trips_used + 1, updated_at = NOW() WHERE user_id = p_user;
    INSERT INTO generation_log (user_id, source) VALUES (p_user, 'free') RETURNING id INTO v_log;
    RETURN jsonb_build_object('source', 'free', 'log_id', v_log);
  END IF;

  IF b.credits > 0 THEN
    UPDATE user_billing SET credits = credits - 1, updated_at = NOW() WHERE user_id = p_user;
    INSERT INTO generation_log (user_id, source) VALUES (p_user, 'credit') RETURNING id INTO v_log;
    RETURN jsonb_build_object('source', 'credit', 'log_id', v_log);
  END IF;

  RETURN jsonb_build_object('source', 'none', 'reason', v_reason);
END $$;

-- Collega il consumo al viaggio creato (serve per le modifiche incluse).
CREATE OR REPLACE FUNCTION attach_generation_trip(p_user UUID, p_log BIGINT, p_trip UUID) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE generation_log SET trip_id = p_trip WHERE id = p_log AND user_id = p_user AND trip_id IS NULL;
$$;

-- Restituisce il credito / il viaggio gratuito se la generazione è fallita per un errore nostro.
CREATE OR REPLACE FUNCTION refund_generation(p_user UUID, p_log BIGINT) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_src TEXT;
BEGIN
  UPDATE generation_log SET refunded_at = NOW()
   WHERE id = p_log AND user_id = p_user AND refunded_at IS NULL
  RETURNING source INTO v_src;
  IF NOT FOUND THEN RETURN; END IF;
  IF v_src = 'credit' THEN
    UPDATE user_billing SET credits = credits + 1, updated_at = NOW() WHERE user_id = p_user;
  ELSIF v_src = 'free' THEN
    UPDATE user_billing SET free_trips_used = GREATEST(0, free_trips_used - 1), updated_at = NOW() WHERE user_id = p_user;
  END IF;
END $$;

-- Una modifica di un viaggio già pagato: inclusa, entro il tetto antiabuso.
CREATE OR REPLACE FUNCTION consume_refinement(p_user UUID, p_trip UUID) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s billing_settings%ROWTYPE;
  l generation_log%ROWTYPE;
BEGIN
  SELECT * INTO s FROM billing_settings LIMIT 1;
  SELECT * INTO l FROM generation_log
   WHERE user_id = p_user AND trip_id = p_trip AND refunded_at IS NULL
   ORDER BY id DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_paid'); END IF;
  IF l.refinements >= s.refinements_per_trip THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'limit_refinements');
  END IF;
  UPDATE generation_log SET refinements = refinements + 1 WHERE id = l.id;
  RETURN jsonb_build_object('ok', true);
END $$;

-- Accredita i viaggi acquistati; idempotente (stesso pagamento = un solo accredito).
CREATE OR REPLACE FUNCTION grant_credits(p_user UUID, p_qty INTEGER, p_ref TEXT) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n INTEGER;
BEGIN
  INSERT INTO credit_ledger (user_id, delta, reason, stripe_ref) VALUES (p_user, p_qty, 'purchase', p_ref)
  ON CONFLICT (stripe_ref) DO NOTHING;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN RETURN FALSE; END IF;
  INSERT INTO user_billing (user_id, credits) VALUES (p_user, p_qty)
  ON CONFLICT (user_id) DO UPDATE SET credits = user_billing.credits + p_qty, updated_at = NOW();
  RETURN TRUE;
END $$;

CREATE OR REPLACE FUNCTION set_stripe_customer(p_user UUID, p_customer TEXT) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO user_billing (user_id, stripe_customer_id) VALUES (p_user, p_customer)
  ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = EXCLUDED.stripe_customer_id, updated_at = NOW();
$$;

CREATE OR REPLACE FUNCTION upsert_subscription(
  p_user UUID, p_sub TEXT, p_status TEXT, p_start TIMESTAMPTZ, p_end TIMESTAMPTZ, p_cancel BOOLEAN
) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO subscriptions (user_id, stripe_subscription_id, status, current_period_start, current_period_end, cancel_at_period_end, updated_at)
  VALUES (p_user, p_sub, p_status, p_start, p_end, p_cancel, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    stripe_subscription_id = EXCLUDED.stripe_subscription_id, status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start, current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end, updated_at = NOW();
$$;

-- Riepilogo per l'app: saldo, viaggio gratuito, abbonamento e uso del periodo.
CREATE OR REPLACE FUNCTION billing_summary(p_user UUID) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s billing_settings%ROWTYPE;
  b user_billing%ROWTYPE;
  sb subscriptions%ROWTYPE;
  v_active BOOLEAN := FALSE;
  v_used_month INTEGER := 0;
  v_used_day INTEGER := 0;
  v_day_start TIMESTAMPTZ := date_trunc('day', NOW() AT TIME ZONE 'Europe/Rome') AT TIME ZONE 'Europe/Rome';
BEGIN
  SELECT * INTO s FROM billing_settings LIMIT 1;
  SELECT * INTO b FROM user_billing WHERE user_id = p_user;
  SELECT * INTO sb FROM subscriptions WHERE user_id = p_user;
  IF FOUND THEN
    v_active := sb.status IN ('active', 'trialing') AND sb.current_period_end > NOW();
    SELECT count(*) INTO v_used_month FROM generation_log
     WHERE user_id = p_user AND source = 'subscription' AND refunded_at IS NULL
       AND created_at >= COALESCE(sb.current_period_start, NOW() - INTERVAL '31 days');
    SELECT count(*) INTO v_used_day FROM generation_log
     WHERE user_id = p_user AND source = 'subscription' AND refunded_at IS NULL AND created_at >= v_day_start;
  END IF;
  RETURN jsonb_build_object(
    'credits', COALESCE(b.credits, 0),
    'free_left', GREATEST(0, s.free_trips - COALESCE(b.free_trips_used, 0)),
    'has_customer', b.stripe_customer_id IS NOT NULL,
    'subscription', CASE WHEN sb.user_id IS NULL THEN NULL ELSE jsonb_build_object(
        'active', v_active, 'status', sb.status, 'period_end', sb.current_period_end,
        'cancel_at_period_end', sb.cancel_at_period_end,
        'used_month', v_used_month, 'used_day', v_used_day) END,
    'limits', jsonb_build_object('monthly', s.monthly_trips, 'daily', s.daily_trips, 'refinements', s.refinements_per_trip)
  );
END $$;

-- Solo il server può chiamarle.
DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'consume_generation(uuid)', 'attach_generation_trip(uuid,bigint,uuid)', 'refund_generation(uuid,bigint)',
    'consume_refinement(uuid,uuid)', 'grant_credits(uuid,integer,text)', 'set_stripe_customer(uuid,text)',
    'upsert_subscription(uuid,text,text,timestamptz,timestamptz,boolean)', 'billing_summary(uuid)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;

-- 5) Eliminazione account: se c'è un abbonamento attivo va prima annullato (altrimenti Stripe
--    continuerebbe ad addebitare). I crediti non usati si perdono con l'account.
CREATE OR REPLACE FUNCTION delete_my_account() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_user UUID := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Non autenticato';
  END IF;
  IF EXISTS (SELECT 1 FROM subscriptions WHERE user_id = v_user AND status IN ('active', 'trialing', 'past_due')) THEN
    RAISE EXCEPTION 'ABBONAMENTO_ATTIVO';
  END IF;
  DELETE FROM shared_trips WHERE trip_id IN (SELECT id FROM trips WHERE user_id = v_user);
  DELETE FROM trips WHERE user_id = v_user;
  DELETE FROM plans WHERE user_id = v_user;
  DELETE FROM auth.users WHERE id = v_user;
END $$;
REVOKE ALL ON FUNCTION delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;
