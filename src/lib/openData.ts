/**
 * Import dei luoghi per l'archivio della prova da fonti aperte — Elly
 *
 * - Wikidata: monumenti, musei, parchi, piazze, spiagge... entro un raggio
 *   dalla destinazione, ordinati per notorietà (numero di pagine Wikipedia
 *   collegate). Licenza CC0: nessun obbligo.
 * - Wikimedia Commons: la foto principale di ogni luogo, con autore e
 *   licenza (da mostrare nell'app, come richiedono le licenze Creative Commons).
 * - OpenStreetMap (Overpass API): ristoranti, caffè e bar con nome. Licenza
 *   ODbL: va citato "© OpenStreetMap contributors".
 *
 * Viene eseguito dal server di Elly (route /api/admin/trial-places), perché
 * quei servizi vanno chiamati da internet "aperta". Uso occasionale e
 * rispettoso delle regole dei servizi: una meta alla volta, con User-Agent
 * che identifica l'app.
 */

import type { ItineraryActivity } from "./tripGenerator";

const UA = "Elly/1.0 (https://planwithelly.com; info@planwithelly.com)";

export type OpenPlace = {
  name: string;
  category: ItineraryActivity["category"];
  description: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  image_credit: string | null;
  image_page: string | null;
  source: "wikidata" | "osm";
  source_id: string;
  popularity: number;
};

export type ResolvedDestination = {
  wikidataId: string;
  label: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
};

async function getJson(url: string, init?: RequestInit, timeoutMs = 8000) {
  const host = new URL(url).host;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": UA, Accept: "application/json", ...(init?.headers ?? {}) },
    });
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    throw new Error(timedOut ? `${host} non ha risposto entro ${Math.round(timeoutMs / 1000)} secondi` : `${host}: ${err instanceof Error ? err.message : "errore di rete"}`);
  }
  if (!res.ok) throw new Error(`${host} ha risposto ${res.status}`);
  return res.json();
}

/** Trova la destinazione su Wikidata (prima voce con coordinate). */
export async function resolveDestination(label: string): Promise<ResolvedDestination> {
  const name = label.split(",")[0].trim();
  const search = await getJson(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=it&uselang=it&type=item&limit=7&format=json`
  );
  const ids: string[] = (search.search ?? []).map((s: { id: string }) => s.id);
  if (ids.length === 0) throw new Error(`"${name}" non trovato su Wikidata`);

  const ent = await getJson(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join("|")}&props=claims|labels&languages=it|en&format=json`
  );
  for (const id of ids) {
    const e = ent.entities?.[id];
    const coord = e?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
    if (!coord) continue;
    // Raggio di ricerca dalla superficie (P2046), se nota: città ~8-15 km, regioni di più.
    let radiusKm = 12;
    const area = e.claims?.P2046?.[0]?.mainsnak?.datavalue?.value;
    if (area?.amount && typeof area.unit === "string") {
      const amount = Math.abs(Number(area.amount));
      const km2 = area.unit.endsWith("Q712226") ? amount : area.unit.endsWith("Q35852") ? amount / 100 : NaN;
      if (Number.isFinite(km2) && km2 > 0) radiusKm = Math.min(60, Math.max(4, Math.sqrt(km2 / Math.PI)));
    }
    return {
      wikidataId: id,
      label: e.labels?.it?.value ?? e.labels?.en?.value ?? name,
      latitude: coord.latitude,
      longitude: coord.longitude,
      radiusKm: Math.round(radiusKm * 10) / 10,
    };
  }
  throw new Error(`"${name}" non ha coordinate su Wikidata`);
}

// Tipi di luogo Wikidata → categoria Elly
const CLASSES: Record<string, ItineraryActivity["category"]> = {
  Q33506: "museo", Q207694: "museo", Q17431399: "museo",
  Q570116: "monumento", Q4989906: "monumento", Q2319498: "monumento", Q16970: "monumento", Q2977: "monumento",
  Q23413: "monumento", Q16560: "monumento", Q839954: "monumento", Q12280: "monumento", Q44539: "monumento",
  Q163687: "monumento", Q1088552: "monumento", Q12518: "monumento", Q57821: "monumento", Q17715832: "monumento",
  Q174782: "attivita", Q123705: "attivita", Q15243209: "attivita", Q24354: "attivita",
  Q22698: "natura", Q1107656: "natura", Q8502: "natura", Q40080: "natura", Q23397: "natura", Q6017969: "natura",
  Q4421: "natura", Q39816: "natura", Q34038: "natura", Q23442: "natura", Q46169: "natura", Q473972: "natura",
};

/** Luoghi notevoli da Wikidata attorno alla destinazione. */
async function wikidataPlaces(d: ResolvedDestination): Promise<OpenPlace[]> {
  // La ricerca per raggio è pesante nelle grandi città: prima un tentativo con raggio contenuto,
  // se Wikidata non risponde in tempo un secondo con raggio dimezzato.
  const attempts: [number, number][] = [[Math.min(d.radiusKm, 10), 22000], [Math.min(d.radiusKm, 5), 12000]];
  let lastErr: unknown = null;
  for (const [radiusKm, timeoutMs] of attempts) {
    try {
      return await wikidataQuery(d, radiusKm, timeoutMs);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Wikidata non disponibile");
}

async function wikidataQuery(d: ResolvedDestination, radiusKm: number, timeoutMs: number): Promise<OpenPlace[]> {
  const values = Object.keys(CLASSES).map((q) => `wd:${q}`).join(" ");
  const query = `
SELECT ?item ?itemLabel ?itemDescription ?lat ?lon ?image ?sitelinks ?class WHERE {
  SERVICE wikibase:around {
    ?item wdt:P625 ?coord .
    bd:serviceParam wikibase:center "Point(${d.longitude} ${d.latitude})"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "${radiusKm}" .
  }
  VALUES ?class { ${values} }
  ?item wdt:P31 ?class .
  ?item wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= 3)
  BIND(geof:latitude(?coord) AS ?lat)
  BIND(geof:longitude(?coord) AS ?lon)
  OPTIONAL { ?item wdt:P18 ?image }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 250`;
  const data = await getJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`, undefined, timeoutMs);
  const seen = new Set<string>();
  const out: OpenPlace[] = [];
  for (const b of data.results?.bindings ?? []) {
    const id = String(b.item.value).split("/").pop()!;
    const name: string = b.itemLabel?.value ?? "";
    if (seen.has(id) || !name || /^Q\d+$/.test(name)) continue;
    seen.add(id);
    const cls = String(b.class.value).split("/").pop()!;
    const file = b.image?.value ? decodeURIComponent(String(b.image.value).split("/Special:FilePath/").pop() ?? "") : null;
    out.push({
      name,
      category: CLASSES[cls] ?? "monumento",
      description: b.itemDescription?.value ?? null,
      latitude: Number(b.lat.value),
      longitude: Number(b.lon.value),
      image_url: file ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=800` : null,
      image_credit: null,
      image_page: file ? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}` : null,
      source: "wikidata",
      source_id: id,
      popularity: Number(b.sitelinks?.value ?? 0),
    });
    if (out.length >= 70) break;
  }
  try {
    await addImageCredits(out);
  } catch {
    for (const p of out) { p.image_url = null; p.image_page = null; }
  }
  return out;
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Autore e licenza di ogni foto (Commons), 40 alla volta. */
async function addImageCredits(places: OpenPlace[]) {
  const withImg = places.filter((p) => p.image_page);
  for (let i = 0; i < withImg.length; i += 40) {
    const chunk = withImg.slice(i, i + 40);
    const titles = chunk.map((p) => decodeURIComponent(p.image_page!.split("/wiki/")[1]));
    const data = await getJson(
      `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=Artist|LicenseShortName&format=json&titles=${encodeURIComponent(titles.join("|"))}`,
      undefined,
      6000
    );
    const byTitle = new Map<string, { artist: string; license: string }>();
    for (const page of Object.values<{ title: string; imageinfo?: { extmetadata?: Record<string, { value: string }> }[] }>(data.query?.pages ?? {})) {
      const md = page.imageinfo?.[0]?.extmetadata;
      if (!md) continue;
      byTitle.set(page.title.replace(/_/g, " "), {
        artist: stripHtml(md.Artist?.value ?? "").slice(0, 80) || "Autore sconosciuto",
        license: stripHtml(md.LicenseShortName?.value ?? "") || "licenza libera",
      });
    }
    for (const p of chunk) {
      const title = decodeURIComponent(p.image_page!.split("/wiki/")[1]).replace(/_/g, " ");
      const c = byTitle.get(title);
      if (c) p.image_credit = `${c.artist} · ${c.license} · Wikimedia Commons`;
      else { p.image_url = null; p.image_page = null; } // senza licenza nota non usiamo la foto
    }
  }
}

const CUISINE_IT: Record<string, string> = {
  italian: "cucina italiana", regional: "cucina tipica", pizza: "pizzeria", seafood: "pesce", portuguese: "cucina portoghese",
  spanish: "cucina spagnola", french: "cucina francese", greek: "cucina greca", japanese: "cucina giapponese",
  sushi: "sushi", ramen: "ramen", thai: "cucina thailandese", vietnamese: "cucina vietnamita", mexican: "cucina messicana",
  indian: "cucina indiana", chinese: "cucina cinese", burger: "burger", vegetarian: "vegetariano", vegan: "vegano",
  coffee_shop: "caffetteria", ice_cream: "gelateria", tapas: "tapas", steak_house: "carne", mediterranean: "cucina mediterranea",
};

/** Ristoranti, caffè e bar con nome da OpenStreetMap, i più "documentati" per primi. */
async function osmPlaces(d: ResolvedDestination): Promise<OpenPlace[]> {
  const r = Math.round(Math.min(d.radiusKm, 4) * 1000);
  const q = `[out:json][timeout:25];
(
  nwr["amenity"~"^(restaurant|cafe|bar|pub)$"]["name"](around:${r},${d.latitude},${d.longitude});
);
out center tags 600;`;
  const init = { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `data=${encodeURIComponent(q)}` };
  let data;
  try {
    data = await getJson("https://overpass-api.de/api/interpreter", init, 22000);
  } catch {
    data = await getJson("https://overpass.kumi.systems/api/interpreter", init, 22000); // server alternativo
  }
  const scored = (data.elements ?? [])
    .map((el: { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags: Record<string, string> }) => {
      const t = el.tags ?? {};
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (typeof lat !== "number" || typeof lon !== "number") return null;
      // Più informazioni ha la scheda (sito, orari, cucina, Wikidata...) più il locale è noto e stabile.
      const score = Object.keys(t).length + (t.wikidata ? 15 : 0) + (t.website || t["contact:website"] ? 4 : 0) + (t.opening_hours ? 2 : 0);
      const cuisine = (t.cuisine ?? "").split(";").map((c) => CUISINE_IT[c.trim()]).filter(Boolean).join(", ");
      const kind = t.amenity === "restaurant" ? "ristorante" : "bar";
      return {
        name: t.name,
        category: kind as ItineraryActivity["category"],
        description: cuisine || (t.amenity === "cafe" ? "caffè" : t.amenity === "restaurant" ? "ristorante" : "bar"),
        latitude: lat,
        longitude: lon,
        image_url: null,
        image_credit: null,
        image_page: null,
        source: "osm" as const,
        source_id: `${el.type}/${el.id}`,
        popularity: score,
      };
    })
    .filter(Boolean) as OpenPlace[];
  scored.sort((a, b) => b.popularity - a.popularity);
  const restaurants = scored.filter((p) => p.category === "ristorante").slice(0, 30);
  const bars = scored.filter((p) => p.category === "bar").slice(0, 12);
  return [...restaurants, ...bars];
}

/**
 * Importa una sola fonte alla volta ("wikidata" o "osm"): ogni chiamata resta entro il tempo
 * massimo della funzione sul server e un problema di una fonte non blocca l'altra.
 */
export async function importPart(label: string, part: "wikidata" | "osm") {
  const dest = await resolveDestination(label);
  let places: OpenPlace[] = [];
  let error: string | null = null;
  try {
    places = part === "wikidata" ? await wikidataPlaces(dest) : await osmPlaces(dest);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  return { dest, places, error };
}
