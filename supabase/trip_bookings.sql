-- Viaggi confermati + checklist delle prenotazioni — Elly
--
-- approved_at: quando chi ha creato il viaggio lo conferma ("Confermo il
-- viaggio"), il viaggio entra nella sezione Viaggi. NULL = non confermato.
--
-- trip_bookings: le voci della checklist (viaggio A/R, alloggio, ristoranti,
-- biglietti...). Vengono generate dall'itinerario al momento della conferma
-- (vedi src/lib/bookingChecklist.ts); l'utente puo' spuntarle, aggiungerne
-- di sue e toglierle. Le vede e le modifica SOLO chi ha creato il viaggio.

ALTER TABLE trips ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE TABLE trip_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('trasporto', 'alloggio', 'ristorante', 'attivita', 'altro')),
  label TEXT NOT NULL,
  detail TEXT,
  maps_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  booked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trip_bookings_trip ON trip_bookings(trip_id, position);

ALTER TABLE trip_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_bookings_owner_all"
  ON trip_bookings FOR ALL
  USING (EXISTS (SELECT 1 FROM trips t WHERE t.id = trip_bookings.trip_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM trips t WHERE t.id = trip_bookings.trip_id AND t.user_id = auth.uid()));
