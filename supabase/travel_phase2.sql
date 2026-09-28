-- ============================================
-- ELLY — Travel Schema (Fase 2)
-- ============================================
-- Aggiunge quanto serve per "I miei viaggi": i viaggi generati vengono
-- ora associati all'utente loggato (user_id), e vanno resi modificabili
-- (dopo una modifica via chat) ed eliminabili dalla lista.
--
-- COME USARLO: Supabase > SQL Editor > incolla > Run.
-- Non tocca nessuna tabella esistente, solo le policy di "trips".
-- ============================================

-- La UPDATE precedente (trips_update_own) richiedeva che la richiesta
-- arrivasse autenticata come l'utente proprietario (auth.uid() = user_id).
-- Le API route del motore di generazione/modifica girano lato server con
-- la chiave anonima (per poter usare le chiavi segrete di Claude/Google
-- Places), senza il token dell'utente: quindi quella condizione non era
-- mai vera e l'aggiornamento falliva silenziosamente dopo ogni modifica
-- via chat. La sicurezza resta a livello applicativo, come già per
-- shared_trips/trip_votes/places.
DROP POLICY IF EXISTS "trips_update_own" ON trips;

CREATE POLICY "trips_update_any"
  ON trips FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Nessuna policy DELETE esisteva ancora su "trips": serve per poter
-- eliminare un viaggio dalla lista "I miei viaggi".
CREATE POLICY "trips_delete_any"
  ON trips FOR DELETE
  USING (true);
