-- ============================================================
-- MY MOOD — Aggiunta colonna neighborhood
-- ============================================================
-- Esegui questo SQL in Supabase → SQL Editor → Run
-- ============================================================

-- STEP 1: Aggiungi la colonna (se non esiste già)
ALTER TABLE venues ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- STEP 2: Assegna il quartiere a ogni venue in base all'indirizzo/nome
-- Le zone principali di Milano usate nell'app:
-- navigli, brera, porta_venezia, isola, porta_nuova, centro, porta_romana, tortona

-- ── NAVIGLI ──────────────────────────────────────────────────
UPDATE venues SET neighborhood = 'navigli' WHERE
  address ILIKE '%navigli%' OR address ILIKE '%ticinese%' OR
  address ILIKE '%corsico%' OR address ILIKE '%vigevano%' OR
  address ILIKE '%fumagalli%' OR address ILIKE '%ripa di porta%' OR
  address ILIKE '%alzaia%' OR name ILIKE '%navigli%' OR
  name ILIKE '%naviglio%' OR address ILIKE '%porta genova%';

-- ── BRERA ────────────────────────────────────────────────────
UPDATE venues SET neighborhood = 'brera' WHERE
  address ILIKE '%brera%' OR address ILIKE '%via solferino%' OR
  address ILIKE '%via madonnina%' OR address ILIKE '%via fiori chiari%' OR
  address ILIKE '%via pontaccio%' OR address ILIKE '%via mercato%' OR
  name ILIKE '%brera%';

-- ── PORTA VENEZIA ────────────────────────────────────────────
UPDATE venues SET neighborhood = 'porta_venezia' WHERE
  address ILIKE '%porta venezia%' OR address ILIKE '%buenos aires%' OR
  address ILIKE '%corso venezia%' OR address ILIKE '%corso buenos%' OR
  address ILIKE '%via lecco%' OR address ILIKE '%via tadino%' OR
  address ILIKE '%via felice cavallotti%' OR address ILIKE '%piazza cavallotti%';

-- ── ISOLA ────────────────────────────────────────────────────
UPDATE venues SET neighborhood = 'isola' WHERE
  address ILIKE '%isola%' OR address ILIKE '%via castillia%' OR
  address ILIKE '%de castillia%' OR address ILIKE '%via borsieri%' OR
  address ILIKE '%via pola%' OR address ILIKE '%garibaldi%' OR
  name ILIKE '%isola%';

-- ── PORTA NUOVA / REPUBLIC ───────────────────────────────────
UPDATE venues SET neighborhood = 'porta_nuova' WHERE
  address ILIKE '%porta nuova%' OR address ILIKE '%piazza gae aulenti%' OR
  address ILIKE '%via della liberazione%' OR address ILIKE '%piazza della repubblica%' OR
  address ILIKE '%via bongiorno%' OR address ILIKE '%mike bongiorno%' OR
  address ILIKE '%viale della liberazione%';

-- ── CENTRO / DUOMO ───────────────────────────────────────────
UPDATE venues SET neighborhood = 'centro' WHERE
  address ILIKE '%piazza duomo%' OR address ILIKE '%via della scala%' OR
  address ILIKE '%piazza della scala%' OR address ILIKE '%corso vittorio%' OR
  address ILIKE '%via montenapoleone%' OR address ILIKE '%via manzoni%' OR
  address ILIKE '%via tivoli%' OR address ILIKE '%piazza san babila%' OR
  name ILIKE '%scala%' OR address ILIKE '%galleria%';

-- ── PORTA ROMANA / PRATI ─────────────────────────────────────
UPDATE venues SET neighborhood = 'porta_romana' WHERE
  address ILIKE '%porta romana%' OR address ILIKE '%via orti%' OR
  address ILIKE '%via vasari%' OR address ILIKE '%via meda%' OR
  address ILIKE '%corso di porta romana%' OR address ILIKE '%via san rocco%' OR
  address ILIKE '%largo isarco%' OR address ILIKE '%via tortona%' OR
  address ILIKE '%via bergognone%';

-- ── SEMPIONE / CITYLIFE ──────────────────────────────────────
UPDATE venues SET neighborhood = 'sempione' WHERE
  address ILIKE '%sempione%' OR address ILIKE '%piazza sempione%' OR
  address ILIKE '%citylife%' OR address ILIKE '%via ceresio%' OR
  address ILIKE '%viale alemagna%' OR address ILIKE '%piero della francesca%' OR
  address ILIKE '%arco della pace%';

-- ── TUTTO QUELLO CHE NON HA ANCORA UN QUARTIERE → 'altro' ───
UPDATE venues SET neighborhood = 'altro'
WHERE neighborhood IS NULL;

-- STEP 3: Verifica (opzionale — puoi eseguirla per controllare)
-- SELECT neighborhood, COUNT(*) FROM venues GROUP BY neighborhood ORDER BY neighborhood;
