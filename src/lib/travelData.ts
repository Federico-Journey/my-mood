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
  bg: "#F1ECE7",
  bgElev: "#FFFFFF",
  text: "#241C1A",
  textMuted: "#8A7D77",
  border: "#E2D8D1",
  accent: "#7A3348",
  accentSoft: "rgba(122,51,72,0.09)",
  accentSoft2: "rgba(122,51,72,0.16)",
  disabledBg: "#E8E0D9",
  disabledText: "#B3A69F",
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
