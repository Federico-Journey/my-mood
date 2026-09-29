-- Notifiche in-app (campanella) — Elly
--
-- Una riga = una notifica per un utente. Tipi previsti:
--   'vote'     un amico ha votato un tuo viaggio (creata dai trigger qui sotto)
--   'bacheca'  nuovo articolo pubblicato in Bacheca (fase successiva)
--   'reminder' promemoria prima della partenza (fase successiva)
--
-- Le notifiche di voto le crea il DATABASE stesso (trigger) e non il codice
-- dell'app: cosi' funzionano qualunque sia il percorso con cui arriva il voto
-- e non si possono dimenticare. Il trigger e' "SECURITY DEFINER" perche' chi
-- vota e' un ospite senza account e non potrebbe scrivere nelle notifiche di
-- un altro utente; e' protetto da un blocco EXCEPTION, cosi' un problema nelle
-- notifiche non puo' mai impedire di registrare un voto.

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vote', 'bacheca', 'reminder')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Ognuno vede, segna come lette ed elimina solo le PROPRIE notifiche.
-- Non esiste una policy di INSERT: le notifiche le scrivono solo i trigger.
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (user_id = auth.uid());

-- 1) Qualcuno vota un viaggio che ha un proprietario -> notifica al proprietario.
CREATE OR REPLACE FUNCTION notify_trip_vote() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_owner UUID;
  v_trip UUID;
  v_dest TEXT;
  v_text TEXT;
BEGIN
  SELECT t.user_id, t.id, COALESCE(NULLIF(t.destination_name, ''), t.title)
    INTO v_owner, v_trip, v_dest
    FROM shared_trips s JOIN trips t ON t.id = s.trip_id
   WHERE s.id = NEW.share_id;

  IF v_owner IS NULL THEN RETURN NEW; END IF;

  v_text := CASE NEW.response
    WHEN 'yes' THEN 'ha votato sì'
    WHEN 'maybe' THEN 'ha votato forse'
    ELSE 'ha votato no'
  END;

  INSERT INTO notifications (user_id, type, title, body, link, trip_id)
  VALUES (v_owner, 'vote', NEW.voter_name || ' ' || v_text, 'Viaggio: ' || v_dest, '/viaggio?id=' || v_trip, v_trip);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trip_votes_notify ON trip_votes;
CREATE TRIGGER trip_votes_notify AFTER INSERT ON trip_votes
  FOR EACH ROW EXECUTE FUNCTION notify_trip_vote();

-- 2) Un viaggio senza proprietario che era gia' stato votato viene salvato
--    da qualcuno -> notifica riepilogativa con i voti arrivati fino a quel momento.
CREATE OR REPLACE FUNCTION notify_trip_claimed_votes() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n INT;
  v_dest TEXT;
BEGIN
  SELECT count(*) INTO n
    FROM trip_votes v JOIN shared_trips s ON s.id = v.share_id
   WHERE s.trip_id = NEW.id;

  IF n > 0 THEN
    v_dest := COALESCE(NULLIF(NEW.destination_name, ''), NEW.title);
    INSERT INTO notifications (user_id, type, title, body, link, trip_id)
    VALUES (
      NEW.user_id, 'vote',
      CASE WHEN n = 1 THEN 'Hai già 1 voto sul viaggio' ELSE 'Hai già ' || n || ' voti sul viaggio' END,
      'Viaggio: ' || v_dest, '/viaggio?id=' || NEW.id, NEW.id
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trips_claimed_notify ON trips;
CREATE TRIGGER trips_claimed_notify AFTER UPDATE OF user_id ON trips
  FOR EACH ROW WHEN (OLD.user_id IS NULL AND NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION notify_trip_claimed_votes();
