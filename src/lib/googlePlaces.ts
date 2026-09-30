/**
 * Validazione luoghi con Google Places — Elly
 *
 * L'AI propone dei nomi di luoghi (ristoranti, musei, attività...) ma può
 * sbagliare o "inventare". Qui cerchiamo ogni luogo su Google: se esiste,
 * l'itinerario riceve coordinate, indirizzo e link a Google Maps; se non lo
 * troviamo resta "da verificare" invece di bloccare tutto.
 *
 * COSTI (Places API "New", listino 2026):
 * 1. Text Search con la sola richiesta dell'identificativo ("IDs Only"):
 *    GRATIS e senza limiti. Ci dice se il luogo esiste e qual è il suo id.
 * 2. Place Details "Essentials" (coordinate + indirizzo): 5 $ ogni 1.000,
 *    con 10.000 chiamate gratuite al mese. Nella stessa chiamata chiediamo
 *    anche se ci sono foto (campo gratuito).
 * Prima, con la vecchia API, ogni verifica costava 32 $ ogni 1.000.
 * Niente stelline: la valutazione è un campo "Enterprise" molto più caro.
 *
 * REGOLE DI GOOGLE SUI DATI SALVATI (Service Specific Terms, Places API):
 * possiamo conservare a tempo indeterminato solo l'identificativo del
 * luogo (place ID) e le coordinate per al massimo 30 giorni. Per questo la
 * tabella "places" tiene solo: nome proposto dall'AI + città (dati nostri),
 * place ID, coordinate con data ("geo_cached_at"). Ogni notte un job
 * cancella le coordinate più vecchie di 30 giorni (supabase/places_new_api.sql).
 * Le foto non si salvano: si chiedono a Google al momento della
 * visualizzazione (vedi /api/places/photo).
 *
 * Se sul progetto Google la nuova API non è ancora abilitata, si torna in
 * automatico alla vecchia (più cara), così l'app non si rompe.
 */

import { supabase } from "./supabase";

export type PlaceMatch = {
  verified: true;
  placeId: string;
  address: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  mapsUrl: string;
  /** URL della nostra route che recupera la foto da Google al momento. null se Google non ha foto. */
  photoUrl: string | null;
};

export type PlaceNotFound = { verified: false };

// Stessa lista di categorie della tabella "places" (CHECK constraint in
// travel_phase1.sql). Definita qui invece che importata da tripGenerator.ts
// per evitare un import circolare — le due liste devono restare allineate.
export type PlaceCategory =
  | "ristorante" | "bar" | "museo" | "monumento" | "natura"
  | "attivita" | "vita_notturna" | "shopping" | "alloggio" | "altro";

const NEW_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const NEW_DETAILS_URL = "https://places.googleapis.com/v1/places/";
const LEGACY_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

/** Le coordinate salvate valgono al massimo 30 giorni (regole Google). */
const GEO_MAX_AGE_MS = 29 * 24 * 60 * 60 * 1000;

export function mapsUrlFor(name: string, placeId: string): string {
  // Formato ufficiale Google ("Urls API"): query testuale + query_place_id,
  // apre il luogo esatto sia da browser sia dall'app Google Maps.
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${encodeURIComponent(placeId)}`;
}

/** Link di ricerca su Google Maps (gratuito, nessuna API) per luoghi non verificati. */
export function mapsSearchUrl(name: string, destination: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${destination}`)}`;
}

function photoUrlForPlace(placeId: string): string {
  return `/api/places/photo?pid=${encodeURIComponent(placeId)}`;
}

// Se la nuova API risponde "non abilitata", non riproviamo a ogni luogo:
// passiamo alla vecchia per qualche minuto.
let newApiDisabledUntil = 0;

type Lookup = { match: PlaceMatch | null; billableDetails: number; legacyCalls: number };

/** Cerca un luogo già validato (solo place ID + coordinate recenti). */
async function getCachedPlace(name: string, destination: string): Promise<{ placeId: string; lat: number | null; lng: number | null; fresh: boolean } | null> {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("google_place_id, latitude, longitude, geo_cached_at")
      .ilike("name", name.trim())
      .ilike("city", destination.trim())
      .not("google_place_id", "is", null)
      .limit(1)
      .maybeSingle();
    if (error || !data?.google_place_id) return null;
    const at = data.geo_cached_at ? new Date(data.geo_cached_at).getTime() : 0;
    const fresh = data.latitude !== null && data.longitude !== null && Date.now() - at < GEO_MAX_AGE_MS;
    return { placeId: data.google_place_id, lat: data.latitude, lng: data.longitude, fresh };
  } catch {
    return null;
  }
}

/** Salva SOLO ciò che le regole Google permettono: place ID e coordinate con data. */
async function cachePlace(name: string, destination: string, category: PlaceCategory, placeId: string, lat: number, lng: number) {
  try {
    await supabase.from("places").upsert(
      {
        name: name.trim(),
        city: destination.trim(),
        category,
        google_place_id: placeId,
        latitude: lat,
        longitude: lng,
        geo_cached_at: new Date().toISOString(),
        address: null,
        google_rating: null,
        photo_ref: null,
        source: "google_places",
        is_verified: true,
      },
      { onConflict: "google_place_id" }
    );
  } catch (err) {
    console.error("[Elly] Errore nel salvare il luogo in cache:", err);
  }
}

/** Place Details (New), campi Essentials: coordinate, indirizzo, presenza di foto. */
async function placeDetails(placeId: string, apiKey: string) {
  const res = await fetch(`${NEW_DETAILS_URL}${encodeURIComponent(placeId)}?languageCode=it`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,location,shortFormattedAddress,photos",
    },
  });
  if (!res.ok) return { ok: false as const, status: res.status };
  const data = await res.json();
  const lat = data.location?.latitude;
  const lng = data.location?.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return { ok: false as const, status: 404 };
  return {
    ok: true as const,
    lat,
    lng,
    address: (data.shortFormattedAddress as string | undefined) ?? null,
    hasPhotos: Array.isArray(data.photos) && data.photos.length > 0,
  };
}

/** Text Search (New) chiedendo solo l'id: gratuito. */
async function searchPlaceId(query: string, apiKey: string): Promise<{ ok: boolean; status: number; placeId: string | null }> {
  const res = await fetch(NEW_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "it", pageSize: 1 }),
  });
  if (!res.ok) return { ok: false, status: res.status, placeId: null };
  const data = await res.json();
  return { ok: true, status: 200, placeId: data.places?.[0]?.id ?? null };
}

/** Vecchia API (32 $ ogni 1.000): usata solo se la nuova non è abilitata. */
async function legacyLookup(name: string, destination: string, apiKey: string): Promise<PlaceMatch | null> {
  const url = `${LEGACY_SEARCH_URL}?query=${encodeURIComponent(`${name}, ${destination}`)}&language=it&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const top = data.results?.[0];
  if (data.status !== "OK" || !top?.place_id) return null;
  const lat = top.geometry?.location?.lat;
  const lng = top.geometry?.location?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    verified: true,
    placeId: top.place_id,
    address: top.formatted_address ?? null,
    latitude: lat,
    longitude: lng,
    rating: null,
    mapsUrl: mapsUrlFor(name, top.place_id),
    photoUrl: Array.isArray(top.photos) && top.photos.length > 0 ? photoUrlForPlace(top.place_id) : null,
  };
}

async function lookup(name: string, destination: string, category: PlaceCategory, apiKey: string): Promise<Lookup> {
  const cached = await getCachedPlace(name, destination);
  if (cached?.fresh && cached.lat !== null && cached.lng !== null) {
    // Già verificato di recente: nessuna chiamata. L'indirizzo non lo
    // conserviamo (regole Google); la foto, se esiste, la recupera la route.
    return {
      match: {
        verified: true,
        placeId: cached.placeId,
        address: null,
        latitude: cached.lat,
        longitude: cached.lng,
        rating: null,
        mapsUrl: mapsUrlFor(name, cached.placeId),
        photoUrl: photoUrlForPlace(cached.placeId),
      },
      billableDetails: 0,
      legacyCalls: 0,
    };
  }
  const useNew = Date.now() > newApiDisabledUntil;

  if (useNew) {
    try {
      let placeId = cached?.placeId ?? null;
      if (!placeId) {
        const found = await searchPlaceId(`${name}, ${destination}`, apiKey);
        if (!found.ok && (found.status === 403 || found.status === 400)) throw Object.assign(new Error("new-api-off"), { off: true });
        if (!found.placeId) return { match: null, billableDetails: 0, legacyCalls: 0 };
        placeId = found.placeId;
      }
      const det = await placeDetails(placeId, apiKey);
      if (!det.ok) {
        if (det.status === 403) throw Object.assign(new Error("new-api-off"), { off: true });
        return { match: null, billableDetails: 1, legacyCalls: 0 };
      }
      void cachePlace(name, destination, category, placeId, det.lat, det.lng);
      return {
        match: {
          verified: true,
          placeId,
          address: det.address,
          latitude: det.lat,
          longitude: det.lng,
          rating: null,
          mapsUrl: mapsUrlFor(name, placeId),
          photoUrl: det.hasPhotos ? photoUrlForPlace(placeId) : null,
        },
        billableDetails: 1,
        legacyCalls: 0,
      };
    } catch (err) {
      if ((err as { off?: boolean }).off) {
        console.warn("[Elly] Places API (New) non abilitata: uso la vecchia API per 10 minuti.");
        newApiDisabledUntil = Date.now() + 10 * 60 * 1000;
      } else {
        console.error("[Elly] Errore Places API (New):", err);
        return { match: null, billableDetails: 0, legacyCalls: 0 };
      }
    }
  }

  // Ripiego: vecchia API.
  try {
    const m = await legacyLookup(name, destination, apiKey);
    if (m) void cachePlace(name, destination, category, m.placeId, m.latitude, m.longitude);
    return { match: m, billableDetails: 0, legacyCalls: 1 };
  } catch (err) {
    console.error("[Elly] Errore nella validazione Google Places (legacy):", err);
    return { match: null, billableDetails: 0, legacyCalls: 1 };
  }
}

export type PlaceBatchResult = {
  results: (PlaceMatch | PlaceNotFound)[];
  /** Chiamate Place Details Essentials (5 $ / 1.000). */
  detailsCalls: number;
  /** Chiamate alla vecchia Text Search (32 $ / 1.000), solo in caso di ripiego. */
  legacyCalls: number;
  /** Luoghi ripresi da un itinerario precedente (nessuna chiamata). */
  reused: number;
};

/**
 * Valida più luoghi in parallelo (4 alla volta).
 * `reuse`: luoghi già verificati nella versione precedente dello stesso
 * viaggio (per nome): durante le modifiche in chat non li richiediamo a Google.
 */
export async function findPlacesBatch(
  items: { name: string; destination: string; category?: PlaceCategory }[],
  reuse?: Map<string, PlaceMatch>
): Promise<PlaceBatchResult> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const results: (PlaceMatch | PlaceNotFound)[] = [];
  let detailsCalls = 0;
  let legacyCalls = 0;
  let reused = 0;
  const CONCURRENCY = 4;

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const out = await Promise.all(
      batch.map(async (it) => {
        const prev = reuse?.get(it.name.trim().toLowerCase());
        if (prev) return { match: prev, billableDetails: 0, legacyCalls: 0, reused: true };
        if (!apiKey) return { match: null, billableDetails: 0, legacyCalls: 0, reused: false };
        return { ...(await lookup(it.name, it.destination, it.category ?? "altro", apiKey)), reused: false };
      })
    );
    for (const o of out) {
      results.push(o.match ?? { verified: false });
      detailsCalls += o.billableDetails;
      legacyCalls += o.legacyCalls;
      if (o.reused) reused++;
    }
  }
  return { results, detailsCalls, legacyCalls, reused };
}
