-- ============================================================
-- MY MOOD — Pulizia Duplicati
-- ============================================================
-- Rimuove le venue duplicate tenendo solo la riga più recente
-- (quella con created_at più alto). Usa ctid come fallback.
-- ============================================================
-- Supabase → SQL Editor → incolla tutto → Run
-- ============================================================

-- Elimina i duplicati (tiene solo la riga più recente per ogni nome)
DELETE FROM venues
WHERE ctid NOT IN (
  SELECT DISTINCT ON (name) ctid
  FROM venues
  ORDER BY name, created_at DESC
);

-- Verifica — deve restituire zero righe
SELECT name, COUNT(*) AS cnt
FROM venues
GROUP BY name
HAVING COUNT(*) > 1;
