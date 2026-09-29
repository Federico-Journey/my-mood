-- Nuova API Google, cache conforme ai termini e database aperto per la prova — Elly
--
-- 1) CACHE "places" CONFORME ALLE REGOLE GOOGLE
--    Le regole di Google Places permettono di conservare a tempo indeterminato
--    solo l'identificativo del luogo (place ID) e le coordinate per al massimo
--    30 giorni. Cancelliamo quindi indirizzi, voti e riferimenti alle foto già
--    salvati, e aggiungiamo la data delle coordinate. Un job notturno cancella
--    le coordinate più vecchie di 30 giorni (il place ID resta: basta una
--    chiamata economica per riaverle).
ALTER TABLE places ADD COLUMN IF NOT EXISTS geo_cached_at TIMESTAMPTZ;

UPDATE places
   SET address = NULL, google_rating = NULL, photo_ref = NULL,
       opening_hours = '{}', images = '{}',
       geo_cached_at = COALESCE(geo_cached_at, updated_at, created_at)
 WHERE source = 'google_places';

UPDATE places SET latitude = NULL, longitude = NULL
 WHERE source = 'google_places' AND geo_cached_at < NOW() - INTERVAL '30 days';

CREATE OR REPLACE FUNCTION expire_google_coordinates() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INTEGER;
BEGIN
  WITH u AS (
    UPDATE places SET latitude = NULL, longitude = NULL
     WHERE source = 'google_places' AND latitude IS NOT NULL
       AND geo_cached_at < NOW() - INTERVAL '30 days'
    RETURNING 1
  ) SELECT count(*) INTO n FROM u;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION expire_google_coordinates() FROM PUBLIC, anon, authenticated;
SELECT cron.schedule('expire-google-coordinates', '45 3 * * *', 'SELECT public.expire_google_coordinates()');

-- 2) MODALITÀ DI GENERAZIONE DEL VIAGGIO
--    'full'  = luoghi verificati con Google
--    'trial' = versione di prova: luoghi dal nostro archivio aperto, nessuna chiamata a Google
ALTER TABLE trips ADD COLUMN IF NOT EXISTS generation_mode TEXT NOT NULL DEFAULT 'full'
  CHECK (generation_mode IN ('full', 'trial'));

-- 3) ARCHIVIO APERTO PER LA PROVA
--    Luoghi da Wikidata e OpenStreetMap, foto da Wikimedia Commons (con autore
--    e licenza). Dati liberi: nessun costo e nessun vincolo di cancellazione.
CREATE TABLE IF NOT EXISTS trial_destinations (
  key TEXT PRIMARY KEY,                 -- es. "lisbona" (minuscolo, senza accenti)
  label TEXT NOT NULL,                  -- es. "Lisbona, Portogallo"
  aliases TEXT[] NOT NULL DEFAULT '{}', -- altre grafie cercabili (es. "lisbon")
  wikidata_id TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km NUMERIC,
  place_count INTEGER NOT NULL DEFAULT 0,
  imported_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS trial_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_key TEXT NOT NULL REFERENCES trial_destinations(key) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'ristorante', 'bar', 'museo', 'monumento', 'natura',
    'attivita', 'vita_notturna', 'shopping', 'alloggio', 'altro')),
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_url TEXT,
  image_credit TEXT,                    -- "Autore · Licenza · Wikimedia Commons"
  image_page TEXT,                      -- pagina della foto su Commons (per l'attribuzione)
  source TEXT NOT NULL CHECK (source IN ('wikidata', 'osm')),
  source_id TEXT NOT NULL,
  popularity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (destination_key, source, source_id)
);
CREATE INDEX IF NOT EXISTS idx_trial_places_dest ON trial_places (destination_key, popularity DESC);

ALTER TABLE trial_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_places ENABLE ROW LEVEL SECURITY;

-- Lettura libera (servono alla generazione anche per chi non ha fatto l'accesso);
-- scrittura solo per gli amministratori (import dalla pagina /admin/prova).
CREATE POLICY "trial_destinations_select_all" ON trial_destinations FOR SELECT USING (true);
CREATE POLICY "trial_places_select_all" ON trial_places FOR SELECT USING (true);
CREATE POLICY "trial_destinations_admin_write" ON trial_destinations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin));
CREATE POLICY "trial_places_admin_write" ON trial_places FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin));
