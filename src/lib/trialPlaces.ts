/**
 * Archivio aperto per la versione di prova — Elly
 *
 * Chi prova Elly senza aver fatto l'accesso riceve un itinerario costruito
 * SOLO con luoghi del nostro archivio (tabelle trial_destinations e
 * trial_places, riempite da /admin/prova con dati Wikidata, OpenStreetMap e
 * foto Wikimedia Commons). Nessuna chiamata a Google: la prova costa solo i
 * pochi centesimi di Claude.
 */

import { supabase } from "./supabase";
import type { ItineraryActivity } from "./tripGenerator";

export type TrialPlace = {
  name: string;
  category: ItineraryActivity["category"];
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  image_credit: string | null;
};

/** "Lisbona, Portogallo" → "lisbona" (minuscolo, senza accenti, prima della virgola). */
export function destinationKey(destination: string): string {
  return destination
    .split(",")[0]
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normName(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Luoghi dell'archivio per la destinazione, o null se la meta non è in archivio. */
export async function loadTrialPlaces(destination: string): Promise<TrialPlace[] | null> {
  const key = destinationKey(destination);
  if (!key) return null;
  const { data: dest } = await supabase
    .from("trial_destinations")
    .select("key, place_count")
    .or(`key.eq."${key}",aliases.cs.{"${key}"}`)
    .limit(1)
    .maybeSingle();
  if (!dest || !dest.place_count) return null;

  const { data } = await supabase
    .from("trial_places")
    .select("name, category, description, latitude, longitude, image_url, image_credit")
    .eq("destination_key", dest.key)
    .order("popularity", { ascending: false })
    .limit(90);
  return data && data.length > 0 ? (data as TrialPlace[]) : null;
}

/** Elenco compatto da mettere nel prompt di Claude. */
export function trialPlacesForPrompt(places: TrialPlace[]): string {
  return places
    .map((p) => `- ${p.name} [${p.category}]${p.description ? `: ${p.description.slice(0, 80)}` : ""}`)
    .join("\n");
}

/** Trova nell'archivio il luogo scelto da Claude (nome uguale o molto simile). */
export function matchTrialPlace(name: string, places: TrialPlace[]): TrialPlace | null {
  const n = normName(name);
  if (!n) return null;
  let best: TrialPlace | null = null;
  for (const p of places) {
    const pn = normName(p.name);
    if (pn === n) return p;
    if (!best && pn.length >= 5 && (n.includes(pn) || pn.includes(n))) best = p;
  }
  return best;
}
