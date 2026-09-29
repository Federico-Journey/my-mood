/**
 * Motore di generazione (e modifica) itinerario — Elly
 *
 * 1. Costruisce un prompt dettagliato a partire dalle scelte dell'utente
 *    (destinazione, date, temi, budget, numero di persone)
 * 2. Chiede a Claude di costruire l'itinerario giorno per giorno, forzando
 *    una risposta strutturata (JSON) tramite "tool use" — così non dobbiamo
 *    sperare che l'AI risponda nel formato giusto, glielo imponiamo.
 * 3. Passa ogni luogo proposto dall'AI a Google Places per verificarlo e
 *    arricchirlo con coordinate e indirizzo reali (vedi googlePlaces.ts).
 *
 * Modalità "trial" (versione di prova): Claude sceglie i luoghi SOLO da un
 * nostro archivio aperto (vedi trialPlaces.ts) e non si chiama mai Google.
 *
 * `refineTrip` riusa la stessa pipeline per le modifiche via chat: manda
 * a Claude l'itinerario attuale + il feedback dell'utente, e si aspetta
 * indietro l'itinerario COMPLETO aggiornato (più semplice e affidabile
 * che chiedere una "patch" parziale).
 */

import Anthropic from "@anthropic-ai/sdk";
import { TRAVEL_THEMES } from "./travelData";
import { findPlacesBatch, mapsSearchUrl, type PlaceMatch } from "./googlePlaces";
import { loadTrialPlaces, trialPlacesForPrompt, matchTrialPlace, normName, type TrialPlace } from "./trialPlaces";
import { claudeCostUsd, GOOGLE_TEXT_SEARCH_USD_PER_CALL, GOOGLE_PLACE_DETAILS_ESSENTIALS_USD_PER_CALL } from "./pricing";

export type ItineraryActivity = {
  time: string;
  name: string;
  category:
    | "ristorante" | "bar" | "museo" | "monumento" | "natura"
    | "attivita" | "vita_notturna" | "shopping" | "alloggio" | "altro";
  description: string;
  tip: string | null;
  estimated_cost_per_person: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  maps_url: string | null;
  photo_url: string | null;
  verified: boolean;
  /** Identificativo Google del luogo (l'unico dato Google conservabile senza limiti). */
  place_id?: string | null;
  /** Autore e licenza della foto, per le foto dell'archivio aperto (Wikimedia Commons). */
  photo_credit?: string | null;
  /** Da dove arriva la verifica: Google o archivio aperto di Elly. */
  source?: "google" | "elly" | null;
};

export type ItineraryDay = {
  day: number;
  date: string | null;
  title: string;
  activities: ItineraryActivity[];
};

export type GenerateTripInput = {
  destination: string;
  people: number;
  startDate: string | null;
  endDate: string | null;
  themes: string[];
  budgetPerPerson: number;
  /** Orario indicativo di inizio giornata (colazione), es. "09:00". Media per tutta la vacanza. */
  startTime: string;
  /** Orario indicativo di cena, es. "20:00". Media per tutta la vacanza. */
  dinnerTime: string;
};

export type GeneratedTrip = {
  title: string;
  subtitle: string;
  changeSummary?: string;
  /** "trial" = versione di prova con luoghi dall'archivio aperto. */
  mode?: GenerationMode;
  days: ItineraryDay[];
};

export type GenerationMode = "full" | "trial";

/** Costo reale (in USD) di una generazione o modifica di itinerario. */
export type GenerationCosts = {
  claudeInputTokens: number;
  claudeOutputTokens: number;
  claudeCostUsd: number;
  /** Chiamate Place Details Essentials (5 $ / 1.000). */
  googleDetailsCalls: number;
  /** Chiamate alla vecchia Text Search (32 $ / 1.000), solo in caso di ripiego. */
  googleLegacyCalls: number;
  /** Luoghi già verificati ripresi senza chiamare Google. */
  googleReused: number;
  googleCostUsd: number;
  totalCostUsd: number;
};

export type GenerateTripResult = {
  trip: GeneratedTrip;
  costs: GenerationCosts;
};

function buildGenerationCosts(
  claude: { inputTokens: number; outputTokens: number },
  google: { details: number; legacy: number; reused: number }
): GenerationCosts {
  const claudeCost = claudeCostUsd(claude.inputTokens, claude.outputTokens);
  const googleCost = google.details * GOOGLE_PLACE_DETAILS_ESSENTIALS_USD_PER_CALL + google.legacy * GOOGLE_TEXT_SEARCH_USD_PER_CALL;
  return {
    claudeInputTokens: claude.inputTokens,
    claudeOutputTokens: claude.outputTokens,
    claudeCostUsd: claudeCost,
    googleDetailsCalls: google.details,
    googleLegacyCalls: google.legacy,
    googleReused: google.reused,
    googleCostUsd: googleCost,
    totalCostUsd: claudeCost + googleCost,
  };
}

/** Istruzioni aggiuntive per la versione di prova. */
function trialBlock(trial: TrialPlace[] | null): string {
  if (!trial) {
    return `- VERSIONE DI PROVA: proponi solo luoghi molto noti e sicuramente esistenti della destinazione. Per pranzi e cene non inventare nomi di locali: indica la zona e il tipo di cucina (es. "Pranzo in trattoria a Trastevere").`;
  }
  return `- VERSIONE DI PROVA: per monumenti, musei, natura e attività usa SOLO luoghi di questo elenco, scrivendo il nome ESATTAMENTE come compare. Per pranzi, cene e drink puoi scegliere un locale dell'elenco; se non c'è niente di adatto indica la zona e il tipo di cucina (es. "Cena in una tasca nel quartiere Alfama") senza inventare nomi.
ELENCO LUOGHI DISPONIBILI:
${trialPlacesForPrompt(trial)}`;
}

type RawActivity = {
  time: string;
  name: string;
  category: ItineraryActivity["category"];
  description: string;
  tip?: string;
  estimated_cost_per_person?: number;
};

type RawItinerary = {
  title: string;
  subtitle: string;
  change_summary?: string;
  days: { day: number; title: string; activities: RawActivity[] }[];
};

// ── Utility date ───────────────────────────────────────────────────
function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function numDaysFor(input: GenerateTripInput, fallback: number): number {
  return input.startDate && input.endDate ? daysBetween(input.startDate, input.endDate) + 1 : fallback;
}

// ── Schema JSON che forziamo a Claude tramite tool use ────────────
const ITINERARY_TOOL: Anthropic.Tool = {
  name: "build_itinerary",
  description: "Costruisce (o aggiorna) l'itinerario di viaggio giorno per giorno",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Titolo evocativo del viaggio, in italiano" },
      subtitle: { type: "string", description: "Una frase che descrive lo spirito del viaggio" },
      change_summary: {
        type: "string",
        description: "SOLO quando stai modificando un itinerario esistente: 1 frase in italiano che spiega cosa hai cambiato e perché, da mostrare all'utente in una chat.",
      },
      days: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "integer" },
            title: { type: "string", description: "Titolo della giornata (es. 'Centro storico e mercati locali')" },
            activities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time: { type: "string", description: "Orario indicativo, es. '09:00'" },
                  name: { type: "string", description: "Nome specifico e reale del luogo/attività (non generico)" },
                  category: {
                    type: "string",
                    enum: ["ristorante", "bar", "museo", "monumento", "natura", "attivita", "vita_notturna", "shopping", "alloggio", "altro"],
                  },
                  description: { type: "string", description: "1-2 frasi su cosa fare/vedere lì" },
                  tip: { type: "string", description: "Un consiglio pratico (orari, prenotazione, come arrivare)" },
                  estimated_cost_per_person: { type: "number", description: "Costo stimato a persona in EUR, 0 se gratuito" },
                },
                required: ["time", "name", "category", "description"],
              },
            },
          },
          required: ["day", "title", "activities"],
        },
      },
    },
    required: ["title", "subtitle", "days"],
  },
};

function buildGeneratePrompt(input: GenerateTripInput, numDays: number, trial?: TrialPlace[] | null): string {
  const themeLabels = input.themes
    .map((id) => TRAVEL_THEMES.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t)
    .map((t) => `${t.label} (${t.desc})`)
    .join("; ");
  const trialText = trial !== undefined ? `\n${trialBlock(trial)}` : "";

  const budgetPerDay = Math.round(input.budgetPerPerson / Math.max(numDays, 1));
  const periodLine = input.startDate && input.endDate
    ? `Il viaggio va dal ${input.startDate} al ${input.endDate}.`
    : "";

  return `Crea un itinerario di viaggio dettagliato, giorno per giorno, con queste caratteristiche:

- Destinazione: ${input.destination}
- Durata: ${numDays} giorni
- ${periodLine}
- Numero di persone: ${input.people}
- Temi/mood del viaggio: ${themeLabels || "generico"}
- Budget indicativo: ${input.budgetPerPerson}€ a persona per l'intero viaggio (~${budgetPerDay}€ a persona al giorno)
- Orari di riferimento: la giornata inizia indicativamente alle ${input.startTime} (colazione/risveglio) e la cena e' prevista verso le ${input.dinnerTime}. Sono medie per l'intera vacanza, non un vincolo rigido per ogni singolo giorno.

Istruzioni:
- Per ogni giorno proponi AL MASSIMO 5-6 attività reali (pasti principali come pranzo/cena inclusi), con orari indicativi. L'itinerario deve avere un carattere rilassato ("chill"), non un programma incastrato minuto per minuto: lascia respiro tra un'attività e l'altra, senza sentirti obbligato a riempire ogni fascia oraria. È normale e voluto lasciare esplicitamente del tempo libero non strutturato (es. "Pomeriggio libero: relax o passeggiata senza meta") quando la giornata lo permette, invece di aggiungere sempre una tappa in più.
- Fai stare il programma di ogni giornata indicativamente tra le ${input.startTime} e le ${input.dinnerTime} (cena inclusa): non iniziare le attivita' prima dell'orario di inizio giornata indicato, e non far slittare la cena molto oltre l'orario indicato. Dopo cena puoi aggiungere al massimo un'attivita' serale leggera (es. una passeggiata, un drink, vita notturna) solo se il tema del viaggio lo richiede esplicitamente — altrimenti la giornata puo' considerarsi conclusa con la cena.
- Usa nomi SPECIFICI e REALI di luoghi (ristoranti, musei, monumenti, quartieri, attività) coerenti con la destinazione — non nomi generici o inventati. Verranno controllati su Google Maps subito dopo, quindi devono essere posti plausibili e verosimili per quella destinazione.
- Rispetta il budget indicato: se è basso preferisci street food/trattorie locali/attività gratuite, se è alto includi anche qualche esperienza premium.
- Rifletti i temi scelti nello stile delle attività proposte (es. se il tema è "storico/bellico" includi musei di guerra, siti storici, memoriali; se è "on the road" struttura le giornate come tappe di un percorso).
- Dai priorità ai luoghi più iconici, fotogenici e conosciuti della destinazione (quelli che chiunque cerca su Instagram o TikTok prima di partire), non a posti generici — ma alterna con qualche chicca meno scontata, per non fare un itinerario di sole trappole turistiche.
- Scrivi tutto in italiano.${trialText}
- Rispondi SOLO chiamando lo strumento "build_itinerary", senza testo aggiuntivo.`;
}

function buildRefinePrompt(input: GenerateTripInput, currentTrip: GeneratedTrip, feedback: string, trial?: TrialPlace[] | null): string {
  const trialText = trial !== undefined ? `\n${trialBlock(trial)}` : "";
  // Mandiamo indietro solo i campi "autoriali": indirizzo/coordinate/rating
  // vengono ri-generati dopo dalla validazione Google Places, non serve
  // rimandarli a Claude (risparmia token e quindi soldi).
  const compactDays = currentTrip.days.map((d) => ({
    day: d.day,
    title: d.title,
    activities: d.activities.map((a) => ({
      time: a.time,
      name: a.name,
      category: a.category,
      description: a.description,
      tip: a.tip ?? undefined,
      estimated_cost_per_person: a.estimated_cost_per_person ?? undefined,
    })),
  }));

  return `Questo è l'itinerario di viaggio attuale (destinazione: ${input.destination}), in JSON:

${JSON.stringify({ title: currentTrip.title, subtitle: currentTrip.subtitle, days: compactDays }, null, 2)}

L'utente ha scritto questo feedback, in una chat, per chiedere una modifica:
"${feedback}"

Promemoria: il programma di ogni giornata deve restare indicativamente tra le ${input.startTime} e le ${input.dinnerTime} (cena inclusa), con al massimo un'attivita' serale leggera dopo cena se il tema del viaggio lo richiede.

Istruzioni:
- Modifica l'itinerario per accontentare la richiesta, cambiando SOLO quello che serve — lascia invariato tutto il resto (stessi orari, stessi luoghi, stesse descrizioni dove non richiesto).
- Se il feedback chiede di aggiungere o sostituire un luogo, usa nomi SPECIFICI e REALI (verranno controllati su Google Maps dopo).
- Mantieni lo stesso numero di giorni, a meno che il feedback non chieda esplicitamente di cambiarlo.
- Compila anche "change_summary": una frase breve, in italiano, colloquiale, che spiega cosa hai cambiato (es. "Ho tolto il museo del giorno 2 e aggiunto una passeggiata al tramonto sul lungomare.").
- Rispondi SOLO chiamando lo strumento "build_itinerary" con l'itinerario COMPLETO aggiornato (tutti i giorni, non solo quello modificato).${trialText}`;
}

/**
 * Chiama Claude forzando la risposta tramite tool use, con i controlli
 * difensivi che servono in entrambi i casi (generazione e modifica).
 */
type ClaudeItineraryResult = {
  raw: RawItinerary;
  inputTokens: number;
  outputTokens: number;
};

async function callClaudeForItinerary(
  client: Anthropic,
  prompt: string,
  numDaysForBudget: number
): Promise<ClaudeItineraryResult> {
  // L'itinerario in JSON può essere lungo (più giorni = più testo): diamo
  // margine ampio, scalando con la durata, per non tagliare la risposta
  // a metà (Haiku 4.5 supporta fino a 64.000 token di output).
  const maxTokens = Math.min(16000, 4000 + numDaysForBudget * 1200);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // modello economico: ~0,016$ a itinerario generato
    max_tokens: maxTokens,
    tools: [ITINERARY_TOOL],
    tool_choice: { type: "tool", name: "build_itinerary" },
    messages: [{ role: "user", content: prompt }],
  });

  if (message.stop_reason === "max_tokens") {
    throw new Error(
      "La risposta generata era troppo lunga ed è stata interrotta. Riprova con una richiesta più breve o una durata minore."
    );
  }

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("Claude non ha restituito un itinerario nel formato atteso.");
  }

  const raw = toolUse.input as RawItinerary;
  if (!raw || !Array.isArray(raw.days) || raw.days.length === 0) {
    throw new Error("La risposta di Claude non conteneva un itinerario valido. Riprova.");
  }
  return {
    raw,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  };
}

/**
 * Arricchisce l'itinerario "grezzo" con dati reali:
 * - modalità "full": verifica con Google (vedi googlePlaces.ts);
 * - modalità "trial": prende i dati dall'archivio aperto, senza Google.
 * In entrambi i casi i luoghi già presenti nella versione precedente dello
 * stesso viaggio (modifiche in chat) vengono ripresi così come sono.
 */
type EnrichedTrip = {
  trip: GeneratedTrip;
  google: { details: number; legacy: number; reused: number };
};

type EnrichOptions = {
  mode: GenerationMode;
  trialPlaces: TrialPlace[] | null;
  previous?: GeneratedTrip;
};

function previousByName(prev?: GeneratedTrip): Map<string, ItineraryActivity> {
  const map = new Map<string, ItineraryActivity>();
  for (const d of prev?.days ?? []) for (const a of d.activities) if (a.verified) map.set(normName(a.name), a);
  return map;
}

async function enrichWithPlaces(raw: RawItinerary, input: GenerateTripInput, opts: EnrichOptions): Promise<EnrichedTrip> {
  const flat = raw.days.flatMap((d) => d.activities);
  const previous = previousByName(opts.previous);
  type Extra = Pick<ItineraryActivity, "address" | "latitude" | "longitude" | "rating" | "maps_url" | "photo_url" | "verified" | "place_id" | "photo_credit" | "source">;
  const unverified = (name: string): Extra => ({
    address: null, latitude: null, longitude: null, rating: null,
    maps_url: mapsSearchUrl(name, input.destination), photo_url: null, verified: false,
    place_id: null, photo_credit: null, source: null,
  });

  const extras: (Extra | null)[] = flat.map((a) => {
    const prev = previous.get(normName(a.name));
    if (!prev) return null;
    return {
      address: prev.address, latitude: prev.latitude, longitude: prev.longitude, rating: prev.rating,
      maps_url: prev.maps_url, photo_url: prev.photo_url, verified: prev.verified,
      place_id: prev.place_id ?? null, photo_credit: prev.photo_credit ?? null, source: prev.source ?? null,
    };
  });
  let reused = extras.filter(Boolean).length;
  let details = 0;
  let legacy = 0;

  if (opts.mode === "trial") {
    flat.forEach((a, i) => {
      if (extras[i]) return;
      const p = opts.trialPlaces ? matchTrialPlace(a.name, opts.trialPlaces) : null;
      extras[i] = p
        ? {
            address: null,
            latitude: p.latitude,
            longitude: p.longitude,
            rating: null,
            maps_url: mapsSearchUrl(p.name, input.destination),
            photo_url: p.image_url,
            verified: true,
            place_id: null,
            photo_credit: p.image_credit,
            source: "elly",
          }
        : unverified(a.name);
    });
  } else {
    const todo = flat.map((a, i) => ({ a, i })).filter(({ i }) => !extras[i]);
    const batch = await findPlacesBatch(
      todo.map(({ a }) => ({ name: a.name, destination: input.destination, category: a.category }))
    );
    details = batch.detailsCalls;
    legacy = batch.legacyCalls;
    reused += batch.reused;
    todo.forEach(({ a, i }, k) => {
      const m = batch.results[k];
      const v: PlaceMatch | null = m.verified ? m : null;
      extras[i] = v
        ? {
            address: v.address, latitude: v.latitude, longitude: v.longitude, rating: v.rating,
            maps_url: v.mapsUrl, photo_url: v.photoUrl, verified: true,
            place_id: v.placeId, photo_credit: null, source: "google",
          }
        : unverified(a.name);
    });
  }

  let cursor = 0;
  const days: ItineraryDay[] = raw.days.map((d) => ({
    day: d.day,
    date: input.startDate ? addDays(input.startDate, d.day - 1) : null,
    title: d.title,
    activities: d.activities.map((a) => ({
      time: a.time,
      name: a.name,
      category: a.category,
      description: a.description,
      tip: a.tip ?? null,
      estimated_cost_per_person: a.estimated_cost_per_person ?? null,
      ...(extras[cursor++] as Extra),
    })),
  }));

  return {
    trip: { title: raw.title, subtitle: raw.subtitle, changeSummary: raw.change_summary, mode: opts.mode, days },
    google: { details, legacy, reused },
  };
}

function requireApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY non configurata. Aggiungila al file .env.local per generare itinerari."
    );
  }
  return apiKey;
}

/** Genera un itinerario da zero a partire dalle scelte dell'utente. */
export async function generateTrip(
  input: GenerateTripInput,
  opts: { mode?: GenerationMode } = {}
): Promise<GenerateTripResult> {
  const mode = opts.mode ?? "full";
  const client = new Anthropic({ apiKey: requireApiKey() });
  const numDays = numDaysFor(input, 3);
  const trialPlaces = mode === "trial" ? await loadTrialPlaces(input.destination) : null;
  const { raw, inputTokens, outputTokens } = await callClaudeForItinerary(
    client,
    buildGeneratePrompt(input, numDays, mode === "trial" ? trialPlaces : undefined),
    numDays
  );
  const { trip, google } = await enrichWithPlaces(raw, input, { mode, trialPlaces });
  return { trip, costs: buildGenerationCosts({ inputTokens, outputTokens }, google) };
}

/** Modifica un itinerario esistente in base al feedback scritto dall'utente in chat. */
export async function refineTrip(
  currentTrip: GeneratedTrip,
  input: GenerateTripInput,
  feedback: string,
  opts: { mode?: GenerationMode } = {}
): Promise<GenerateTripResult> {
  const mode = opts.mode ?? "full";
  const client = new Anthropic({ apiKey: requireApiKey() });
  const trialPlaces = mode === "trial" ? await loadTrialPlaces(input.destination) : null;
  const { raw, inputTokens, outputTokens } = await callClaudeForItinerary(
    client,
    buildRefinePrompt(input, currentTrip, feedback, mode === "trial" ? trialPlaces : undefined),
    currentTrip.days.length
  );
  const { trip, google } = await enrichWithPlaces(raw, input, { mode, trialPlaces, previous: currentTrip });
  return { trip, costs: buildGenerationCosts({ inputTokens, outputTokens }, google) };
}
