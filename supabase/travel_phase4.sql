-- ============================================
-- ELLY — Travel Schema (Fase 4)
-- ============================================
-- Aggiunge il riferimento alla foto del luogo (per il "diario di viaggio"
-- stampabile con foto reali). "photo_ref" è il "photo_reference" restituito
-- da Google Places: non è un URL diretto, va richiesto tramite l'API Photo
-- passando anche la chiave — per questo motivo l'immagine viene sempre
-- servita tramite una nostra API route (/api/places/photo), che tiene la
-- chiave lato server e non la espone mai al browser.
--
-- COME USARLO: Supabase > SQL Editor > incolla > Run.
-- ============================================

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS photo_ref TEXT;
