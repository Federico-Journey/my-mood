-- Eliminazione dell'account e pulizia dei viaggi non salvati — Elly
--
-- 1) delete_my_account(): l'utente loggato cancella se stesso dal Profilo
--    (supabase.rpc("delete_my_account")). Nessuna chiave segreta e' necessaria:
--    la funzione e' "SECURITY DEFINER" e agisce SOLO su auth.uid(), cioe' sull'utente
--    che la chiama. Ordine: link condivisi (con i voti, a cascata) -> viaggi
--    (con checklist, notifiche, viaggiatori a cascata) -> vecchi piani My Mood ->
--    utente (profilo, preferiti ecc. a cascata).
--    Le ricevute (revenue_events) restano per obblighi fiscali, ma scollegate
--    dall'utente (user_id diventa NULL).
--
-- 2) cleanup_unsaved_trips(): elimina i viaggi senza proprietario (mai salvati)
--    piu' vecchi di 30 giorni, con i loro link di condivisione. Lo esegue ogni
--    notte alle 03:30 UTC un job pg_cron (creato una volta, vedi in fondo).

CREATE OR REPLACE FUNCTION delete_my_account() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_user UUID := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Non autenticato';
  END IF;
  DELETE FROM shared_trips WHERE trip_id IN (SELECT id FROM trips WHERE user_id = v_user);
  DELETE FROM trips WHERE user_id = v_user;
  DELETE FROM plans WHERE user_id = v_user;
  DELETE FROM auth.users WHERE id = v_user;
END $$;

REVOKE ALL ON FUNCTION delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;

CREATE OR REPLACE FUNCTION cleanup_unsaved_trips() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n INTEGER;
BEGIN
  DELETE FROM shared_trips
   WHERE trip_id IN (SELECT id FROM trips WHERE user_id IS NULL AND created_at < NOW() - INTERVAL '30 days');
  WITH d AS (
    DELETE FROM trips WHERE user_id IS NULL AND created_at < NOW() - INTERVAL '30 days' RETURNING 1
  ) SELECT count(*) INTO n FROM d;
  RETURN n;
END $$;

REVOKE ALL ON FUNCTION cleanup_unsaved_trips() FROM PUBLIC, anon, authenticated;

-- Da eseguire una sola volta (gia' fatto):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-unsaved-trips', '30 3 * * *', 'SELECT public.cleanup_unsaved_trips()');
