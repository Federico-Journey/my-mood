-- ============================================
-- MY MOOD — Database Schema (Fase 0-1)
-- ============================================
-- Questo file contiene le tabelle iniziali per il lancio.
-- Le tabelle per eventi/voti/social verranno aggiunte nella Fase 2.
--
-- COME USARLO:
-- 1. Vai su Supabase > SQL Editor
-- 2. Incolla tutto questo codice
-- 3. Clicca "Run"
-- ============================================

-- ============================================
-- 1. PROFILES (estende auth.users di Supabase)
-- ============================================
-- Supabase gestisce già la tabella auth.users per login/registrazione.
-- Noi creiamo "profiles" per i dati extra dell'utente (nome, avatar, preferenze).
-- Si collega automaticamente all'utente autenticato tramite l'id.

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  interests TEXT[] DEFAULT '{}',
  favorite_moods TEXT[] DEFAULT '{}',
  default_budget TEXT CHECK (default_budget IN ('low', 'mid', 'high', 'luxury')),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commento: quando un utente si registra, creiamo automaticamente il suo profilo
-- con un "trigger" (funzione automatica del database).

-- Funzione che crea il profilo automaticamente dopo la registrazione
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: ogni volta che un nuovo utente si registra, esegui la funzione sopra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Funzione per aggiornare automaticamente "updated_at"
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. VENUES (locali, ristoranti, attività)
-- ============================================
-- I posti che My Mood suggerisce nei piani serata.
-- Inizialmente li popoliamo a mano con i ~25 locali del prototipo,
-- poi nella Fase 1 li arricchiremo con Google Places API.

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  type TEXT NOT NULL CHECK (type IN (
    'bar', 'ristorante', 'club', 'lounge', 'pizzeria',
    'trattoria', 'cocktail_bar', 'rooftop', 'parco',
    'museo', 'teatro', 'cinema', 'attivita', 'altro'
  )),
  price_range TEXT NOT NULL CHECK (price_range IN ('low', 'mid', 'high', 'luxury')),
  compatible_moods TEXT[] DEFAULT '{}',
  description TEXT,
  tips TEXT,
  emoji TEXT,
  google_place_id TEXT,
  google_rating NUMERIC(2,1),
  opening_hours JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_partner BOOLEAN DEFAULT FALSE,
  boost_level INTEGER DEFAULT 0 CHECK (boost_level BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indice per cercare velocemente i locali per mood
CREATE INDEX idx_venues_moods ON venues USING GIN (compatible_moods);
CREATE INDEX idx_venues_type ON venues (type);
CREATE INDEX idx_venues_price ON venues (price_range);
CREATE INDEX idx_venues_active ON venues (is_active) WHERE is_active = TRUE;

-- ============================================
-- 3. PLANS (piani serata generati)
-- ============================================
-- Ogni volta che un utente sceglie mood + compagnia + budget,
-- viene generato un piano e salvato qui.
-- "steps" è un array JSON con la sequenza di locali e orari.

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  mood TEXT NOT NULL,
  company TEXT NOT NULL,
  budget TEXT NOT NULL CHECK (budget IN ('low', 'mid', 'high', 'luxury')),
  title TEXT NOT NULL,
  subtitle TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  ai_generated BOOLEAN DEFAULT FALSE,
  shared_count INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nota: user_id è nullable perché gli utenti non registrati possono
-- comunque generare piani (li salviamo per analytics).

CREATE INDEX idx_plans_user ON plans (user_id);
CREATE INDEX idx_plans_mood ON plans (mood);
CREATE INDEX idx_plans_created ON plans (created_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================
-- RLS controlla chi può leggere/scrivere ogni riga del database.
-- È fondamentale per la sicurezza: senza RLS, chiunque con la
-- chiave pubblica potrebbe leggere tutti i dati.

-- PROFILES: ogni utente vede e modifica solo il proprio profilo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chiunque può vedere i profili pubblici"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Gli utenti modificano solo il proprio profilo"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- VENUES: tutti possono leggere, solo admin possono modificare
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chiunque può vedere i locali attivi"
  ON venues FOR SELECT
  USING (is_active = true);

-- Per ora non creiamo policy di INSERT/UPDATE per venues.
-- Li gestiremo dal pannello admin di Supabase o tramite service_role key.

-- PLANS: ogni utente vede i propri piani, può crearne di nuovi
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gli utenti vedono i propri piani"
  ON plans FOR SELECT
  USING (
    user_id = auth.uid()
    OR user_id IS NULL  -- piani anonimi visibili per condivisione
  );

CREATE POLICY "Chiunque può creare un piano"
  ON plans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Gli utenti aggiornano solo i propri piani"
  ON plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. DATI INIZIALI — Venues del prototipo
-- ============================================
-- Inseriamo i locali che già appaiono nel prototipo statico,
-- così il sito funziona subito con dati reali.

INSERT INTO venues (name, address, type, price_range, compatible_moods, description, tips, emoji) VALUES

-- Locali Rilassato
('Navigli Walk & Drink', 'Alzaia Naviglio Grande', 'bar', 'low', ARRAY['rilassato', 'social'],
 'Passeggiata lungo i Navigli con sosta aperitivo in uno dei tanti locali affacciati sull''acqua.',
 'I locali sul lato sinistro hanno la luce migliore al tramonto', '🍷'),

('Trattoria Milanese', 'Via Santa Marta, 11', 'trattoria', 'mid', ARRAY['rilassato', 'elegante'],
 'Cucina tradizionale milanese dal 1933. Cotoletta, risotto, ossobuco — i classici fatti bene.',
 'La cotoletta alla milanese è la migliore della città', '🍝'),

('Mag Cafè', 'Ripa di Porta Ticinese, 43', 'cocktail_bar', 'mid', ARRAY['rilassato', 'romantico'],
 'Cocktail artigianali in un''atmosfera intima sui Navigli. Mixology creativa con ingredienti stagionali.',
 'Prova il cocktail del giorno — cambiano ogni settimana', '🍸'),

-- Locali Avventuroso
('Spirit de Milan', 'Via Bovisasca, 59', 'club', 'mid', ARRAY['avventuroso', 'social'],
 'Ex fabbrica trasformata in balera moderna. Swing, jazz dal vivo e cucina milanese in un ambiente unico.',
 'Il giovedì sera c''è la serata swing con lezione gratuita', '🎷'),

('East Market Diner', 'Via Privata Giovanni Ventura, 4', 'ristorante', 'mid', ARRAY['avventuroso', 'social'],
 'American diner nel cuore di Lambrate. Smash burger, milkshake e atmosfera vintage anni ''50.',
 'Il double smash burger è il piatto da non perdere', '🍔'),

-- Locali Social / On Fire
('Botanical Club', 'Via Pastrengo, 11', 'cocktail_bar', 'mid', ARRAY['social', 'avventuroso'],
 'Cocktail botanici in un giardino nascosto nel cuore di Isola. Vibes tropicali e musica lounge.',
 'Il giardino interno è magico — puntate lì', '🌿'),

('Bros Milano', 'Via Solferino, 33', 'pizzeria', 'low', ARRAY['social', 'rilassato'],
 'Cucina pugliese contemporanea. Piatti da condividere, porzioni generose e atmosfera conviviale.',
 'Ordinate più piatti da condividere — è il modo migliore', '🍕'),

('Alcatraz', 'Via Valtellina, 25', 'club', 'mid', ARRAY['social', 'avventuroso'],
 'Club storico di Milano per concerti e serate. Spazio enorme, sound system top, line-up internazionali.',
 'Comprate i biglietti online — spesso sold out alla porta', '🎶'),

-- Locali Romantico
('Terrazza Aperol', 'Piazza del Duomo, 21', 'rooftop', 'mid', ARRAY['romantico', 'elegante'],
 'Aperitivo con vista mozzafiato sul Duomo. Il tramonto da qui è uno spettacolo.',
 'Arrivate prima delle 18 per i posti migliori con vista', '🌅'),

('Carlo e Camilla in Segheria', 'Via Giuseppe Meda, 24', 'ristorante', 'high', ARRAY['romantico', 'elegante'],
 'Ristorante stellato in un''ex segheria. Tavoli comuni su un lungo bancone, cucina d''autore di Carlo Cracco.',
 'Il tasting menu è l''esperienza completa — vale ogni euro', '✨'),

('Fonderie Milanesi', 'Via Giovenale, 7', 'cocktail_bar', 'mid', ARRAY['romantico', 'culturale'],
 'Cocktail d''autore in un''ex fonderia Art Nouveau. Atmosfera intima con mattoni a vista e luci soffuse.',
 'Il piano di sotto è più tranquillo e romantico', '🕯️'),

-- Locali Culturale
('Triennale Milano', 'Viale Alemagna, 6', 'museo', 'low', ARRAY['culturale', 'rilassato'],
 'Museo del design e dell''arte contemporanea. Mostre rotanti che cambiano ogni pochi mesi.',
 'Il bar con terrazza sul parco Sempione è perfetto per un caffè dopo la visita', '🎨'),

('Blue Note Milano', 'Via Pietro Borsieri, 37', 'club', 'mid', ARRAY['culturale', 'elegante'],
 'Il tempio del jazz a Milano. Concerti dal vivo ogni sera con artisti internazionali.',
 'Prenotate cena + concerto per l''esperienza completa', '🎵'),

('Piccolo Teatro', 'Via Rovello, 2', 'teatro', 'mid', ARRAY['culturale', 'romantico'],
 'Il primo teatro stabile italiano. Programmazione d''eccellenza tra classici e contemporaneo.',
 'I posti in platea centrale offrono la migliore acustica', '🎭'),

-- Locali Elegante
('Armani/Bamboo Bar', 'Via Manzoni, 31', 'cocktail_bar', 'high', ARRAY['elegante', 'romantico'],
 'Il bar dell''Armani Hotel. Cocktail impeccabili in un ambiente di design assoluto con giardino di bambù.',
 'Il tavolo vicino al giardino di bambù è il migliore', '🥂'),

('Langosteria', 'Via Savona, 10', 'ristorante', 'luxury', ARRAY['elegante', 'romantico'],
 'Il miglior ristorante di pesce di Milano. Crudi, pasta ai frutti di mare e bollicine in ambiente raffinato.',
 'Il plateau di crudi misti è leggendario', '🦞'),

('Ceresio 7', 'Via Ceresio, 7', 'rooftop', 'high', ARRAY['elegante', 'social'],
 'Rooftop con piscina nel cuore di Milano. Vista skyline, cucina contemporanea e DJ set serali.',
 'Prenotare è obbligatorio, specialmente per il weekend', '🏊');
