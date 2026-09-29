/**
 * Ricerca delle destinazioni per "Dove vuoi andare?".
 *
 * L'elenco (circa 6.900 voci: Paesi, citta' principali, capitali, citta'
 * italiane, isole e zone turistiche) sta in public/data/destinations.json
 * e viene scaricato una sola volta, solo quando l'utente arriva a questa
 * schermata. La ricerca avviene tutta nel browser: nessun costo per ricerca.
 * Come e' stato generato: scripts/build-destinations.mjs.
 * Dati geografici: GeoNames (CC BY 4.0).
 */

// [nome, ISO2, altre grafie per la ricerca, rango, tipo]  (tipo: 0 citta', 1 zona, 2 Paese)
type RawEntry = [string, string, string, number, 0 | 1 | 2];

export type Destination = {
  /** Testo da scrivere nel campo quando si sceglie la voce, es. "Lisbona, Portogallo". */
  label: string;
  name: string;
  /** Riga secondaria: il Paese, o "Paese" per le voci che sono un intero Paese. */
  subtitle: string;
  flag: string;
};

type Indexed = { entry: RawEntry; name: string; alias: string };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

let cache: Promise<Indexed[]> | null = null;

/** Scarica (una sola volta) e indicizza l'elenco. In caso di errore restituisce un elenco vuoto. */
export function loadDestinations(): Promise<Indexed[]> {
  if (!cache) {
    cache = fetch("/data/destinations.json")
      .then((r) => (r.ok ? (r.json() as Promise<RawEntry[]>) : []))
      .then((rows) => rows.map((entry) => ({ entry, name: norm(entry[0]), alias: norm(entry[2]) })))
      .catch(() => {
        cache = null; // riproveremo alla prossima apertura
        return [];
      });
  }
  return cache;
}

let countryNames: Intl.DisplayNames | null = null;
function countryName(cc: string) {
  try {
    countryNames ??= new Intl.DisplayNames(["it"], { type: "region" });
    return countryNames.of(cc) ?? cc;
  } catch {
    return cc;
  }
}

function flagEmoji(cc: string) {
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function toDestination([name, cc, , , type]: RawEntry): Destination {
  const country = countryName(cc);
  return {
    label: type === 2 ? name : `${name}, ${country}`,
    name,
    subtitle: type === 2 ? "Paese" : country,
    flag: flagEmoji(cc),
  };
}

/**
 * Cerca nell'elenco. Ordine dei risultati: nome uguale, nome che inizia con
 * quanto scritto, una parola del nome che inizia cosi', grafia alternativa
 * (es. "Lisbon", "Seville"), poi contenuto; a parita' vince la meta' piu' nota.
 */
export function searchDestinations(index: Indexed[], query: string, limit = 8): Destination[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const scored: { s: number; rank: number; entry: RawEntry }[] = [];
  for (const { entry, name, alias } of index) {
    let s = -1;
    if (name === q) s = 0;
    else if (alias && ` ${alias} `.includes(` ${q} `)) s = 0.5; // grafia alternativa esatta ("Rome", "Seville")
    else if (name.startsWith(q)) s = 1;
    else if (name.includes(` ${q}`) || name.includes(`-${q}`)) s = 2;
    else if (alias && (alias.startsWith(q) || alias.includes(` ${q}`))) s = 3;
    else if (q.length >= 3 && name.includes(q)) s = 4;
    else if (q.length >= 3 && alias.includes(q)) s = 5;
    if (s >= 0) scored.push({ s, rank: entry[3], entry });
  }
  scored.sort((a, b) => a.s - b.s || b.rank - a.rank);
  return scored.slice(0, limit).map((x) => toDestination(x.entry));
}
