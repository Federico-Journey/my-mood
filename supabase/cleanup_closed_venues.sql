-- ============================================================
-- MY MOOD — Rimozione Venue Chiuse / Inesistenti
-- ============================================================
-- Venue verificate come chiuse definitivamente o inesistenti
-- tramite ricerche web (aprile 2026)
-- ============================================================
-- Supabase → SQL Editor → incolla tutto → Run
-- ============================================================

-- 1) Plastic — chiuso definitivamente giugno 2025
DELETE FROM venues WHERE name = 'Plastic';

-- 2) Old Fashion Club — chiuso gennaio 2024 (Triennale non ha rinnovato)
DELETE FROM venues WHERE name = 'Old Fashion Club';

-- 3) Dude Club — chiuso definitivamente dal 2019
DELETE FROM venues WHERE name = 'Dude Club';

-- 4) Carlo e Camilla in Segheria — chiuso, spazio riconvertito
DELETE FROM venues WHERE name = 'Carlo e Camilla in Segheria';

-- 5) East Market Diner — sede standalone chiusa
DELETE FROM venues WHERE name = 'East Market Diner';

-- 6) Piscina Argelati — chiusa dal 2023, riapertura non prima del 2030
DELETE FROM venues WHERE name = 'Piscina Argelati';

-- 7) Tokuyoshi — chiuso definitivamente
DELETE FROM venues WHERE name = 'Tokuyoshi';

-- 8) Just Cavalli — rinominato "JustMe Milano", aggiorniamo il nome
UPDATE venues
SET name = 'JustMe Milano',
    description = 'Ex Just Cavalli, rinnovato e ribrandizzato: club-ristorante alla Torre Branca con design contemporaneo, clientela fashion, serate con DJ internazionali.',
    tips = 'La cena + discoteca è il pacchetto migliore — entri senza coda e mangi bene.'
WHERE name = 'Just Cavalli';

-- 9) Bros Milano — non esiste a Milano
DELETE FROM venues WHERE name = 'Bros Milano';

-- 10) Pista Brera — Ice Rink — non esiste come venue permanente
DELETE FROM venues WHERE name LIKE 'Pista Brera%';

-- Verifica: mostra le venue rimanenti con questi nomi (dovrebbe essere vuoto)
SELECT name FROM venues
WHERE name IN (
  'Plastic', 'Old Fashion Club', 'Dude Club',
  'Carlo e Camilla in Segheria', 'East Market Diner',
  'Piscina Argelati', 'Tokuyoshi', 'Just Cavalli',
  'Bros Milano', 'Pista Brera — Ice Rink'
);
-- Se tutto ok, restituisce 0 righe.

-- Verifica che JustMe Milano esista
SELECT name FROM venues WHERE name = 'JustMe Milano';
