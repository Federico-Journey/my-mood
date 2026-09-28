-- ============================================
-- ELLY — Travel Schema (Fase 5)
-- ============================================
-- "shared_trips" finora si poteva solo creare (INSERT), mai aggiornare.
-- Ora che un viaggio ha un solo link di condivisione fisso (riusato invece
-- di crearne uno nuovo a ogni "Condividi"), serve poter aggiornare
-- l'itinerario condiviso quando viene modificato via chat dopo la prima
-- condivisione. Sicurezza a livello applicativo, come per le altre tabelle
-- "open" di questo schema.
--
-- COME USARLO: Supabase > SQL Editor > incolla > Run.
-- ============================================

CREATE POLICY "shared_trips_update_any"
  ON shared_trips FOR UPDATE
  USING (true)
  WITH CHECK (true);
