-- ============================================
-- ELLY (ex My Mood) — Travel Schema (Fase 1)
-- ============================================
-- Nuove tabelle per il pivot da "piani serata a Milano" a "itinerari di viaggio".
-- NON tocca le tabelle esistenti (profiles, venues, plans, shared_plans, plan_votes,
-- businesses): restano intatte con tutti i dati. Si puliranno più avanti se non
-- servono piu'.
--
-- COME USARLO:
-- 1. Vai su Supabase > SQL Editor
-- 2. Incolla tutto questo codice
-- 3. Clicca "Run"
--
-- Richiede che esista gia' la funzione update_updated_at(), creata in schema.sql.
-- ============================================

-- ============================================
-- 1. PLACES (luoghi/attivita' — versione globale di "venues")
-- ============================================
-- A differenza di "venues" (25 locali di Milano scritti a mano), "places" si
-- popola dinamicamente: ogni volta che l'AI genera un itinerario, i luoghi
-- vengono validati con Google Places e salvati qui, per qualsiasi destinazione.

CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  category TEXT NOT NULL CHECK (category IN (
    'ristorante', 'bar', 'museo', 'monumento', 'natura',
    'attivita', 'vita_notturna', 'shopping', 'alloggio', 'altro'
  )),
  price_range TEXT CHECK (price_range IN ('low', 'mid', 'high', 'luxury')),
  theme_tags TEXT[] DEFAULT '{}',
  description TEXT,
  tips TEXT,
  emoji TEXT,
  google_place_id TEXT UNIQUE,
  google_rating NUMERIC(2,1),
  opening_hours JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  -- "source" traccia da dove viene il dato: utile per capire quanto fidarsi
  -- di un luogo (google_places = verificato, ai = da controllare, manual = curato)
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'google_places', 'manual')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_places_themes ON places USING GIN (theme_tags);
CREATE INDEX idx_places_category ON places (category);
CREATE INDEX idx_places_city ON places (city);
CREATE INDEX idx_places_google_place_id ON places (google_place_id);

-- ============================================
-- 2. TRIPS (itinerari di viaggio — versione multi-giorno di "plans")
-- ============================================
-- Ogni volta che un utente inserisce destinazione + durata + temi, viene
-- generato un itinerario e salvato qui. "itinerary" e' un array JSON: un
-- oggetto per ogni giorno, con mattina/pomeriggio/sera. Esempio:
-- [
--   { "day": 1, "date": "2027-03-10", "mattina": "...", "pomeriggio": "...",
--     "sera": "...", "place_ids": ["uuid-1", "uuid-2"] },
--   ...
-- ]

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  destination_name TEXT NOT NULL,
  destination_country TEXT,
  start_date DATE,
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 30),
  themes TEXT[] NOT NULL DEFAULT '{}',
  title TEXT NOT NULL,
  subtitle TEXT,
  itinerary JSONB NOT NULL DEFAULT '[]',
  budget_estimate JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT TRUE,
  shared_count INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_trips_user ON trips (user_id);
CREATE INDEX idx_trips_themes ON trips USING GIN (themes);
CREATE INDEX idx_trips_created ON trips (created_at DESC);

-- ============================================
-- 3. TRIP_TRAVELERS (chi viaggia — la personalizzazione vista nel PDF Vietnam)
-- ============================================
-- Cattura chi partecipa al viaggio, da dove parte, e se si aggiunge o lascia
-- il gruppo a meta' (es. "il fratello arriva da Singapore", "papa' fino al
-- giorno 8"). "joins_day"/"leaves_day" sono numeri di giorno del viaggio
-- (1 = primo giorno).

CREATE TABLE trip_travelers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  departure_city TEXT,
  joins_day INTEGER NOT NULL DEFAULT 1,
  leaves_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trip_travelers_trip ON trip_travelers (trip_id);

-- ============================================
-- 4. SHARED_TRIPS (versione pubblica e condivisibile di un trip)
-- ============================================
-- Quando un utente condivide un itinerario (via WhatsApp/link), ne creiamo
-- una "fotografia" pubblica qui, cosi' chi la riceve la vede senza login.
-- Ricalca lo schema gia' usato con successo da "shared_plans".

CREATE TABLE shared_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  theme_accent TEXT,
  trip_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shared_trips_trip ON shared_trips (trip_id);

-- ============================================
-- 5. TRIP_VOTES (voto di gruppo — stesso meccanismo di "plan_votes")
-- ============================================
-- Gli amici che ricevono il link votano se ci stanno: e' il differenziatore
-- principale di Elly rispetto ai competitor (nessuno lo offre).

CREATE TABLE trip_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES shared_trips(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  response TEXT NOT NULL CHECK (response IN ('yes', 'no', 'maybe')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trip_votes_share ON trip_votes (share_id);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- PLACES: tutti possono leggere, nessuna policy di scrittura diretta dal
-- client (i luoghi si inseriscono dal backend con la service_role key)
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "places_select_all"
  ON places FOR SELECT
  USING (true);

-- TRIPS: come "plans" — ogni utente vede i propri, i viaggi anonimi restano
-- visibili (servono per condividere prima di creare un account)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_select_own_or_anonymous"
  ON trips FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "trips_insert_any"
  ON trips FOR INSERT
  WITH CHECK (true);

CREATE POLICY "trips_update_own"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TRIP_TRAVELERS: leggibili da chi vede il trip, inseribili da chi lo crea
ALTER TABLE trip_travelers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_travelers_select_all"
  ON trip_travelers FOR SELECT
  USING (true);

CREATE POLICY "trip_travelers_insert_any"
  ON trip_travelers FOR INSERT
  WITH CHECK (true);

-- SHARED_TRIPS: pubblici in lettura (serve per il link condiviso)
ALTER TABLE shared_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_trips_select_all"
  ON shared_trips FOR SELECT
  USING (true);

CREATE POLICY "shared_trips_insert_any"
  ON shared_trips FOR INSERT
  WITH CHECK (true);

-- TRIP_VOTES: come "plan_votes" — pubblici, nessuna autenticazione richiesta
ALTER TABLE trip_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_votes_select_all"
  ON trip_votes FOR SELECT
  USING (true);

CREATE POLICY "trip_votes_insert_any"
  ON trip_votes FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 7. PROFILES — un campo utile in piu'
-- ============================================
-- La citta' di partenza di default, per pre-compilare "da dove parti"
-- quando l'utente crea un nuovo viaggio.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS home_city TEXT;
