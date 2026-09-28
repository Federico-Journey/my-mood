/**
 * Validazione luoghi con Google Places — Elly
 *
 * L'AI propone dei nomi di luoghi (ristoranti, musei, attività...) ma può
 * sbagliare o "inventare" (le AI a volte generano posti che non esistono
 * davvero — il cosiddetto hallucination risk). Questa funzione cerca ogni
 * luogo proposto su Google Places: se lo trova, arricchisce l'itinerario
 * con indirizzo reale, coordinate, rating e link a Google Maps. Se non lo
 * trova, lascia il luogo "non verificato" invece di bloccare tutto —
 * meglio un itinerario con qualche luogo da ricontrollare a mano che
 * nessun itinerario.
 *
 * CACHE: ogni luogo trovato viene salvato nella tabella "places". Prima di
 * richiamare Google Places, controlliamo se lo stesso nome+destinazione è
 * già stato validato in passato (es. una modifica via chat ri-valida quasi
 * sempre gli stessi luoghi, o due itinerari diversi propongono lo stesso
 * monumento famoso). Questo è il modo più semplice per abbattere il costo
 * variabile più alto per itinerario generato, senza toccare il motore AI.
 * La cache è "best effort": se fallisce (rete, permessi) non blocca mai
 * la generazione, semplicemente richiama Google Places come prima.
 */

import { supabase } from "./supabase";

export type PlaceMatch = {
  verified: true;
  placeId: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  mapsUrl: string;
  // URL alla nostra API route che fa da proxy verso Google Places Photo
  // (tiene la chiave lato server). null se Google non ha foto per questo luogo.
  photoUrl: string | null;
};

export type PlaceNotFound = { verified: false };

// Stessa lista di categorie della tabella "places" (CHECK constraint in
// travel_phase1.sql). Definita qui invece che importata da tripGenerator.ts
// per evitare un import circolare — le due liste devono restare allineate.
export type PlaceCategory =
  | "ristorante" | "bar" | "museo" | "monumento" | "natura"
  | "attivita" | "vita_notturna" | "shopping" | "alloggio" | "altro";

const TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

function mapsUrlFor(placeId: string): string {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
}

function photoUrlFor(photoRef: string | null): string | null {
  return photoRef ? `/api/places/photo?ref=${encodeURIComponent(photoRef)}` : null;
}

/** Cerca un luogo già validato in passato per lo stesso nome+destinazione. */
async function getCachedPlace(name: string, destination: string): Promise<PlaceMatch | null> {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("google_place_id, address, latitude, longitude, google_rating, photo_ref")
      .ilike("name", name.trim())
      .ilike("city", destination.trim())
      .not("google_place_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.google_place_id || !data.address) return null;
    if (data.latitude === null || data.longitude === null) return null;

    return {
      verified: true,
      placeId: data.google_place_id,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      rating: data.google_rating ?? null,
      mapsUrl: mapsUrlFor(data.google_place_id),
      photoUrl: photoUrlFor(data.photo_ref ?? null),
    };
  } catch {
    return null;
  }
}

/** Salva un luogo appena validato, così la prossima volta non richiama Google Places. */
async function cachePlace(
  name: string,
  destination: string,
  category: PlaceCategory,
  match: PlaceMatch,
  photoRef: string | null
): Promise<void> {
  try {
    await supabase.from("places").upsert(
      {
        name: name.trim(),
        city: destination.trim(),
        category,
        address: match.address,
        latitude: match.latitude,
        longitude: match.longitude,
        google_place_id: match.placeId,
        google_rating: match.rating,
        photo_ref: photoRef,
        source: "google_places",
        is_verified: true,
      },
      { onConflict: "google_place_id" }
    );
  } catch (err) {
    // Non blocchiamo mai la generazione per un errore di cache.
    console.error("[Elly] Errore nel salvare il luogo in cache:", err);
  }
}

/**
 * Cerca un luogo su Google Places a partire dal nome proposto dall'AI
 * e dalla destinazione del viaggio (per disambiguare, es. "Duomo" a Milano
 * vs "Duomo" a Firenze). Controlla prima la cache locale.
 */
export async function findPlace(
  name: string,
  destination: string,
  category: PlaceCategory = "altro"
): Promise<PlaceMatch | PlaceNotFound> {
  const cached = await getCachedPlace(name, destination);
  if (cached) return cached;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // Nessuna chiave configurata: non blocchiamo la generazione, semplicemente
    // non arricchiamo con dati reali.
    return { verified: false };
  }

  try {
    const query = `${name}, ${destination}`;
    const url = `${TEXT_SEARCH_URL}?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return { verified: false };

    const data = await res.json();
    if (data.status !== "OK" || !Array.isArray(data.results) || data.results.length === 0) {
      return { verified: false };
    }

    const top = data.results[0];
    const placeId: string | undefined = top.place_id;
    const address: string | undefined = top.formatted_address;
    const lat: number | undefined = top.geometry?.location?.lat;
    const lng: number | undefined = top.geometry?.location?.lng;
    const photoRef: string | null = top.photos?.[0]?.photo_reference ?? null;

    if (!placeId || !address || lat === undefined || lng === undefined) {
      return { verified: false };
    }

    const match: PlaceMatch = {
      verified: true,
      placeId,
      address,
      latitude: lat,
      longitude: lng,
      rating: typeof top.rating === "number" ? top.rating : null,
      mapsUrl: mapsUrlFor(placeId),
      photoUrl: photoUrlFor(photoRef),
    };

    // Non aspettiamo il salvataggio in cache per rispondere: è solo per il
    // futuro, non deve rallentare l'itinerario che l'utente sta aspettando.
    void cachePlace(name, destination, category, match, photoRef);

    return match;
  } catch (err) {
    console.error("[Elly] Errore nella validazione Google Places:", err);
    return { verified: false };
  }
}

/**
 * Valida più luoghi in parallelo (con un piccolo limite di concorrenza
 * per non sparare troppe richieste insieme).
 */
export async function findPlacesBatch(
  items: { name: string; destination: string; category?: PlaceCategory }[]
): Promise<(PlaceMatch | PlaceNotFound)[]> {
  const results: (PlaceMatch | PlaceNotFound)[] = [];
  const CONCURRENCY = 4;

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((it) => findPlace(it.name, it.destination, it.category))
    );
    results.push(...batchResults);
  }

  return results;
}
