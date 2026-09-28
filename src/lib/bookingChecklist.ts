/**
 * Checklist delle prenotazioni — Elly
 *
 * Quando chi ha creato un viaggio lo conferma ("Confermo il viaggio"), il
 * viaggio entra nella sezione Viaggi e generiamo una checklist a partire
 * dall'itinerario: il viaggio di andata e ritorno, l'alloggio, ogni
 * ristorante e le attivita'/musei per cui di solito serve un biglietto.
 * L'utente poi spunta cosa ha gia' prenotato, e puo' aggiungere voci sue.
 *
 * Vedi supabase/trip_bookings.sql per lo schema e le regole di accesso
 * (solo il proprietario del viaggio vede e modifica la sua checklist).
 */

import { supabase } from "./supabase";
import type { ItineraryDay } from "./tripGenerator";

export type BookingCategory = "trasporto" | "alloggio" | "ristorante" | "attivita" | "altro";

export type BookingItem = {
  id: string;
  trip_id: string;
  category: BookingCategory;
  label: string;
  detail: string | null;
  maps_url: string | null;
  position: number;
  is_booked: boolean;
  booked_at: string | null;
};

/** Ordine e nomi delle sezioni, come appaiono nella checklist. */
export const BOOKING_SECTIONS: { category: BookingCategory; title: string }[] = [
  { category: "trasporto", title: "Viaggio" },
  { category: "alloggio", title: "Alloggio" },
  { category: "ristorante", title: "Ristoranti" },
  { category: "attivita", title: "Biglietti e attività" },
  { category: "altro", title: "Altro" },
];

type NewBooking = Omit<BookingItem, "id" | "is_booked" | "booked_at">;

/**
 * Costruisce le voci della checklist a partire dall'itinerario.
 * Funzione "pura" (nessuna chiamata al database): facile da leggere e da
 * modificare se vuoi cambiare quali voci proporre.
 */
export function buildChecklist(tripId: string, destination: string, days: ItineraryDay[]): NewBooking[] {
  const items: NewBooking[] = [];
  const seen = new Set<string>();
  let position = 0;

  const push = (category: BookingCategory, label: string, detail: string | null, mapsUrl: string | null) => {
    const key = `${category}|${label.trim().toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ trip_id: tripId, category, label, detail, maps_url: mapsUrl, position: position++ });
  };

  // 1. Andata e ritorno: c'e' sempre, anche se l'itinerario non ne parla.
  push("trasporto", "Viaggio di andata e ritorno", `Volo, treno o auto per ${destination}`, null);

  // 2. Alloggio: i luoghi "alloggio" proposti dall'itinerario, oppure una
  //    voce generica se l'itinerario non ne indica uno preciso.
  const lodgings = days.flatMap((d) =>
    d.activities.filter((a) => a.category === "alloggio").map((a) => ({ a, day: d.day }))
  );
  if (lodgings.length > 0) {
    for (const { a, day } of lodgings) push("alloggio", a.name, `Dal giorno ${day}`, a.maps_url);
  } else {
    const nights = Math.max(1, days.length - 1);
    push("alloggio", `Alloggio a ${destination}`, `${nights} ${nights === 1 ? "notte" : "notti"}`, null);
  }

  // 3. Ristoranti e 4. attivita'/musei, nell'ordine in cui compaiono nel viaggio.
  for (const d of days) {
    for (const a of d.activities) {
      const when = `Giorno ${d.day} · ${a.time}`;
      if (a.category === "ristorante") push("ristorante", a.name, when, a.maps_url);
      if (a.category === "museo" || a.category === "attivita") push("attivita", a.name, when, a.maps_url);
    }
  }

  return items;
}

/**
 * Conferma un viaggio: segna la data di conferma e, se la checklist non
 * esiste ancora (prima conferma), la genera dall'itinerario salvato.
 * Se il viaggio era gia' stato confermato e poi tolto, la checklist
 * esistente viene ritrovata cosi' com'era, con le spunte gia' messe.
 */
export async function approveTrip(tripId: string): Promise<{ error: string | null }> {
  const { data: trip, error: readError } = await supabase
    .from("trips")
    .select("id, destination_name, itinerary")
    .eq("id", tripId)
    .maybeSingle();
  if (readError || !trip) return { error: "Non trovo il viaggio da confermare." };

  const { error: updateError } = await supabase
    .from("trips")
    .update({ approved_at: new Date().toISOString() })
    .eq("id", tripId);
  if (updateError) return { error: "Non sono riuscito a confermare il viaggio. Riprova." };

  const { count } = await supabase
    .from("trip_bookings")
    .select("id", { count: "exact", head: true })
    .eq("trip_id", tripId);

  if (!count) {
    const rows = buildChecklist(tripId, trip.destination_name, (trip.itinerary ?? []) as ItineraryDay[]);
    const { error: insertError } = await supabase.from("trip_bookings").insert(rows);
    if (insertError) return { error: "Viaggio confermato, ma non sono riuscito a creare la checklist. Riapri il viaggio per riprovare." };
  }

  return { error: null };
}

/** Toglie il viaggio dai confermati. La checklist resta salvata. */
export async function unapproveTrip(tripId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("trips").update({ approved_at: null }).eq("id", tripId);
  return { error: error ? "Non sono riuscito a togliere la conferma. Riprova." : null };
}
