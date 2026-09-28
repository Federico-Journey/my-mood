// ══════════════════════════════════════════════════
// ELLY — Travel data (temi di viaggio, viaggiatori, palette)
// ══════════════════════════════════════════════════
import type { Mood } from "./data";

// I temi di viaggio riusano la stessa forma dei "mood" delle serate,
// ma con contenuti pensati per un viaggio invece che per una serata a Milano.
export type Theme = Mood & { icon: string };

export const TRAVEL_THEMES: Theme[] = [
  { id: "adventure",   emoji: "⚡",  label: "Avventuroso",       color: "#F59E0B", desc: "Trekking, natura selvaggia, fuori dai sentieri battuti", icon: "adventure" },
  { id: "history_war", emoji: "🎖️", label: "Storico / bellico", color: "#78716C", desc: "Musei di guerra, siti storici, memoria dei luoghi", icon: "history_war" },
  { id: "on_the_road", emoji: "🏍️", label: "On the road",       color: "#B24A2C", desc: "In moto o auto, strada libera, tappa dopo tappa", icon: "on_the_road" },
  { id: "relax",       emoji: "🌊",  label: "Relax",             color: "#06B6D4", desc: "Ritmo lento, mare o natura, zero stress", icon: "relax" },
  { id: "cultural",    emoji: "🎭",  label: "Culturale",         color: "#EC4899", desc: "Arte, tradizioni locali, musei e monumenti", icon: "cultural" },
];

export type Traveler = {
  id: string;
  name: string;
  departureCity: string;
  joinsDay: number;
  leavesDay: number | null; // null = resta fino alla fine del viaggio
};

// ── Palette Elly ("Vino e Pietra": tortora caldo + bordeaux) ─────
export const ELLY_ACCENT = "#7A3348";

export const ELLY_COLORS = {
  // Stile "cartografico": carta chiara, inchiostro caldo, accento vino.
  bg: "#FBFAF7",
  bgElev: "#FFFFFF",
  text: "#22201F",
  textMuted: "#7C746F",
  border: "#E7E1DA",
  accent: "#7A3348",
  accentSoft: "rgba(122,51,72,0.08)",
  accentSoft2: "rgba(122,51,72,0.15)",
  disabledBg: "#EEE9E3",
  disabledText: "#B5ABA4",
  // Sfondo pagina completo: colore carta + curve di livello appena visibili.
  // Da usare solo come "background" dei contenitori di pagina, non come colore.
  paper: `#FBFAF7 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='360' viewBox='0 0 360 360'%3E%3Cg fill='none' stroke='%237A3348' stroke-opacity='0.06' stroke-width='1'%3E%3Cpath d='M40 180c0-66 56-122 134-122s146 44 146 116-66 128-146 128S40 246 40 180z'/%3E%3Cpath d='M74 180c0-50 44-92 102-92s112 34 112 90-50 98-112 98S74 230 74 180z'/%3E%3Cpath d='M108 182c0-34 32-62 70-62s76 24 76 62-36 66-76 66-70-32-70-66z'/%3E%3Cpath d='M142 184c0-19 18-34 40-34s40 14 40 34-20 36-40 36-40-17-40-36z'/%3E%3Cpath d='M-20 40c46-22 100-12 146 12s112 22 180-12 94-22 94-22'/%3E%3Cpath d='M-20 330c56 12 112-12 168-6s124 28 232-6'/%3E%3C/g%3E%3C/svg%3E") center top / 360px repeat`,
} as const;

/** Font del nuovo stile (caricati in src/app/layout.tsx). */
export const ELLY_FONTS = {
  display: "var(--font-display)",
  body: "var(--font-body)",
} as const;

// ── Suggerimenti destinazione (per l'autocomplete) ────────────────
export type DestinationSuggestion = { name: string; country: string; flag: string };

export const DESTINATION_SUGGESTIONS: DestinationSuggestion[] = [
  { name: "Lisbona", country: "Portogallo", flag: "🇵🇹" },
  { name: "Porto", country: "Portogallo", flag: "🇵🇹" },
  { name: "Barcellona", country: "Spagna", flag: "🇪🇸" },
  { name: "Roma", country: "Italia", flag: "🇮🇹" },
  { name: "Sicilia", country: "Italia", flag: "🇮🇹" },
  { name: "Toscana", country: "Italia", flag: "🇮🇹" },
  { name: "Parigi", country: "Francia", flag: "🇫🇷" },
  { name: "Amsterdam", country: "Paesi Bassi", flag: "🇳🇱" },
  { name: "Praga", country: "Rep. Ceca", flag: "🇨🇿" },
  { name: "Vienna", country: "Austria", flag: "🇦🇹" },
  { name: "Berlino", country: "Germania", flag: "🇩🇪" },
  { name: "Londra", country: "Regno Unito", flag: "🇬🇧" },
  { name: "Atene", country: "Grecia", flag: "🇬🇷" },
  { name: "Santorini", country: "Grecia", flag: "🇬🇷" },
  { name: "Marrakech", country: "Marocco", flag: "🇲🇦" },
  { name: "Tokyo", country: "Giappone", flag: "🇯🇵" },
  { name: "Bangkok", country: "Thailandia", flag: "🇹🇭" },
  { name: "Bali", country: "Indonesia", flag: "🇮🇩" },
  { name: "New York", country: "USA", flag: "🇺🇸" },
  { name: "Reykjavik", country: "Islanda", flag: "🇮🇸" },
  { name: "Dubrovnik", country: "Croazia", flag: "🇭🇷" },
  { name: "Hanoi", country: "Vietnam", flag: "🇻🇳" },
  { name: "Il Cairo", country: "Egitto", flag: "🇪🇬" },
  { name: "Buenos Aires", country: "Argentina", flag: "🇦🇷" },
];

// ── Bozza di viaggio in corso di creazione ────────────────────────
// Nota: la versione precedente usava durationDays + travelers dettagliati.
// Il nuovo flusso chiede date reali (calendario) e un numero di persone;
// i dettagli per singolo viaggiatore si aggiungeranno più avanti, quando
// si invita il gruppo a votare l'itinerario.
export type TripDraft = {
  destination: string;
  people: number;
  startDate: string | null; // ISO yyyy-mm-dd
  endDate: string | null;   // ISO yyyy-mm-dd
  themes: string[];
  budgetPerPerson: number;
};
