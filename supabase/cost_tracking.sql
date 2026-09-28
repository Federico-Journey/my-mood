-- Monitoraggio costi (Claude, Google Places, Vercel, Supabase, altro) e
-- ricavi — Elly
--
-- Obiettivo: sapere quanto costa davvero generare/modificare un viaggio
-- (dati reali, non stimati) per calibrare il prezzo del modello
-- "pay per trip", e avere un quadro chiaro di costi vs ricavi per centro
-- di costo.
--
-- cost_events: un evento = un costo.
--   - Costi variabili legati a un viaggio specifico (una chiamata Claude o
--     Google durante una generazione/modifica) vengono inseriti in automatico
--     dal codice, con trip_id valorizzato.
--   - Costi fissi/ricorrenti (es. il canone mensile di Vercel o Supabase,
--     il dominio) non riguardano un singolo viaggio: si inseriscono a mano
--     dalla dashboard admin, con trip_id NULL.
--
-- revenue_events: un evento = un incasso. Finché non c'è un sistema di
-- pagamento automatico collegato, si inseriscono a mano dalla dashboard
-- admin (source = 'trip_purchase' quando sarà pay-per-trip).

CREATE TABLE cost_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  cost_center TEXT NOT NULL CHECK (cost_center IN ('claude', 'google_places', 'vercel', 'supabase', 'altro')),
  description TEXT,
  -- quantity/unit sono solo informativi (es. quantity=1500, unit='output_tokens'
  -- o quantity=3, unit='api_call'), utili per capire il "perché" del costo
  -- senza dover ricalcolare tutto a mano.
  quantity NUMERIC,
  unit TEXT,
  amount_usd NUMERIC(12,6) NOT NULL CHECK (amount_usd >= 0),
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_events_center_date ON cost_events(cost_center, occurred_at);
CREATE INDEX idx_cost_events_trip ON cost_events(trip_id);

CREATE TABLE revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'trip_purchase' CHECK (source IN ('trip_purchase', 'subscription', 'altro')),
  description TEXT,
  amount_usd NUMERIC(12,2) NOT NULL CHECK (amount_usd >= 0),
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revenue_events_source_date ON revenue_events(source, occurred_at);

-- Chi può vedere i dati economici dell'app: solo il/i profilo/i admin.
-- (Fede diventa admin con un UPDATE separato una volta noto il suo profilo,
-- vedi fondo file.)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE cost_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;

-- Lettura dei costi: solo admin (i dati economici non sono mai pubblici).
CREATE POLICY "cost_events_select_admin_only"
  ON cost_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));

-- Inserimento permissivo come per "trips_insert_any" (travel_phase1.sql):
-- avviene solo dal codice server (route API, con la chiave anon che il
-- progetto già usa lato server) o dalla dashboard admin, mai da input
-- diretto dell'utente finale nel browser. Stesso compromesso già accettato
-- per la tabella trips; si può irrigidire in futuro con una service role
-- key dedicata alle route server, se serve.
CREATE POLICY "cost_events_insert_any"
  ON cost_events FOR INSERT
  WITH CHECK (true);

-- I ricavi, per ora, si leggono E si scrivono solo da admin (inserimento
-- manuale dalla dashboard finché non c'è un pagamento automatico collegato).
CREATE POLICY "revenue_events_admin_all"
  ON revenue_events FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));

-- Da eseguire una volta noto l'account con cui Fede accede a Elly:
-- UPDATE profiles SET is_admin = TRUE
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'INSERISCI_EMAIL');
