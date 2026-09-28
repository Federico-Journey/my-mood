-- ============================================
-- ELLY — Travel Schema (Fase 3)
-- ============================================
-- Abilita la scrittura in "places": la tabella era pensata come cache dei
-- luoghi già validati con Google Places (vedi commento in travel_phase1.sql),
-- ma finora nessuna policy permetteva di scriverci dalla chiave anonima
-- usata dalle API route del motore di generazione. Senza questa modifica
-- ogni itinerario richiama Google Places da zero per ogni luogo, anche se
-- e' gia' stato validato in una generazione precedente — è la voce di
-- costo più alta per itinerario generato (vedi analisi economica nel
-- project brief). Sicurezza a livello applicativo, come per le altre
-- tabelle "open" di questo schema (trips, shared_trips, trip_votes).
--
-- COME USARLO: Supabase > SQL Editor > incolla > Run.
-- ============================================

CREATE POLICY "places_insert_any"
  ON places FOR INSERT
  WITH CHECK (true);

CREATE POLICY "places_update_any"
  ON places FOR UPDATE
  USING (true)
  WITH CHECK (true);
