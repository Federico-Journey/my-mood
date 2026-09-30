// ══════════════════════════════════════════════════
// ELLY — Travel data (temi di viaggio, viaggiatori, palette)
// ══════════════════════════════════════════════════
type Mood = { id: string; emoji: string; label: string; color: string; desc: string };

// I temi di viaggio riusano la stessa forma dei "mood" delle serate,
// ma con contenuti pensati per un viaggio invece che per una serata a Milano.
// Sono raggruppati in categorie per la schermata di scelta (max 3 selezionabili).
// "desc" finisce anche nel prompt di Claude: descrive cosa deve proporre.
export type ThemeGroup = "natura" | "cultura" | "gusto" | "relax" | "stile";
export type Theme = Mood & { icon: string; group: ThemeGroup };

export const THEME_GROUPS: { id: ThemeGroup; label: string }[] = [
  { id: "natura", label: "Natura e avventura" },
  { id: "cultura", label: "Cultura e storia" },
  { id: "gusto", label: "Gusto e serate" },
  { id: "relax", label: "Relax e benessere" },
  { id: "stile", label: "Stile di viaggio" },
];

export const TRAVEL_THEMES: Theme[] = [
  // Natura e avventura
  { id: "adventure",   group: "natura", emoji: "⚡",  label: "Avventuroso",         color: "#F59E0B", desc: "Trekking, natura selvaggia, fuori dai sentieri battuti", icon: "adventure" },
  { id: "hiking",      group: "natura", emoji: "🥾",  label: "Trekking e cammini",  color: "#65A30D", desc: "Sentieri, cammini a tappe, giornate a piedi con panorami e rifugi", icon: "hiking" },
  { id: "nature",      group: "natura", emoji: "🏞️", label: "Natura e panorami",   color: "#16A34A", desc: "Parchi, laghi, punti panoramici, albe e tramonti", icon: "nature" },
  { id: "beach",       group: "natura", emoji: "🏖️", label: "Mare e spiagge",      color: "#0EA5E9", desc: "Spiagge, calette, giri in barca, giornate di sole", icon: "beach" },
  { id: "mountain",    group: "natura", emoji: "🏔️", label: "Montagna",            color: "#64748B", desc: "Alpi e vette, laghi alpini, rifugi, sci e sport invernali in stagione", icon: "mountain" },
  { id: "water_sports",group: "natura", emoji: "🤿",  label: "Sport d'acqua",       color: "#0891B2", desc: "Snorkeling, immersioni, surf, kayak, vela", icon: "water_sports" },
  { id: "wildlife",    group: "natura", emoji: "🦁",  label: "Safari e fauna",      color: "#CA8A04", desc: "Safari, osservazione di animali, riserve e parchi naturali", icon: "wildlife" },

  // Cultura e storia
  { id: "cultural",    group: "cultura", emoji: "🎭", label: "Culturale",           color: "#EC4899", desc: "Arte, tradizioni locali, musei e monumenti", icon: "cultural" },
  { id: "history_war", group: "cultura", emoji: "🎖️", label: "Storico / bellico",  color: "#78716C", desc: "Musei di guerra, siti storici, memoria dei luoghi", icon: "history_war" },
  { id: "architecture",group: "cultura", emoji: "🏛️", label: "Architettura e design", color: "#A16207", desc: "Edifici iconici, quartieri d'autore, design e architettura contemporanea", icon: "architecture" },
  { id: "cinema",      group: "cultura", emoji: "🎬", label: "Cinema e serie TV",   color: "#7C3AED", desc: "Set di film e serie, luoghi resi celebri dallo schermo", icon: "cinema" },
  { id: "spiritual",   group: "cultura", emoji: "🕯️", label: "Spirituale",         color: "#9333EA", desc: "Templi, santuari, cammini spirituali, meditazione e silenzio", icon: "spiritual" },
  { id: "local_life",  group: "cultura", emoji: "🧺", label: "Vita locale",         color: "#C2410C", desc: "Mercati, quartieri autentici, botteghe e incontri con la gente del posto", icon: "local_life" },

  // Gusto e serate
  { id: "food",        group: "gusto", emoji: "🍝",  label: "Food e cucina locale", color: "#DC2626", desc: "Piatti tipici, mercati, trattorie storiche, street food, corsi di cucina", icon: "food" },
  { id: "wine",        group: "gusto", emoji: "🍷",  label: "Vino e cantine",       color: "#9F1239", desc: "Cantine, degustazioni, vigneti, enoteche e wine bar", icon: "wine" },
  { id: "nightlife",   group: "gusto", emoji: "🍸",  label: "Vita notturna",        color: "#4F46E5", desc: "Cocktail bar, musica dal vivo, locali e club", icon: "nightlife" },
  { id: "shopping",    group: "gusto", emoji: "🛍️", label: "Shopping e mercatini", color: "#DB2777", desc: "Boutique, mercatini, artigianato e prodotti tipici da portare a casa", icon: "shopping" },

  // Relax e benessere
  { id: "relax",       group: "relax", emoji: "🌊",  label: "Relax",                color: "#06B6D4", desc: "Ritmo lento, mare o natura, zero stress", icon: "relax" },
  { id: "wellness",    group: "relax", emoji: "🧖",  label: "Benessere e spa",      color: "#14B8A6", desc: "Terme, spa, massaggi, yoga, hotel con centro benessere", icon: "wellness" },
  { id: "romantic",    group: "relax", emoji: "💞",  label: "Romantico",            color: "#E11D48", desc: "Tramonti, cene speciali, hotel di charme, momenti in due", icon: "romantic" },
  { id: "luxury",      group: "relax", emoji: "✨",  label: "Lusso",                color: "#B45309", desc: "Hotel 5 stelle, ristoranti stellati, esperienze esclusive", icon: "luxury" },

  // Stile di viaggio
  { id: "on_the_road", group: "stile", emoji: "🏍️", label: "On the road",         color: "#B24A2C", desc: "In moto o auto, strada libera, tappa dopo tappa", icon: "on_the_road" },
  { id: "city_break",  group: "stile", emoji: "🏙️", label: "City break",          color: "#475569", desc: "Pochi giorni in città: i luoghi imperdibili senza perdere tempo", icon: "city_break" },
  { id: "family",      group: "stile", emoji: "👨‍👩‍👧", label: "Con bambini",       color: "#F97316", desc: "Attività adatte alle famiglie, ritmi tranquilli, pause e spazi per i più piccoli", icon: "family" },
  { id: "friends",     group: "stile", emoji: "🎉",  label: "Tra amici",            color: "#D946EF", desc: "Esperienze da fare in gruppo, divertimento e serate insieme", icon: "friends" },
  { id: "photography", group: "stile", emoji: "📷",  label: "Fotografia",           color: "#0F766E", desc: "Luoghi fotogenici, luce dell'alba e del tramonto, scorci da cartolina", icon: "photography" },
  { id: "events",      group: "stile", emoji: "🎟️", label: "Eventi e sport",       color: "#2563EB", desc: "Concerti, festival, partite, gran premi e appuntamenti in calendario", icon: "events" },
  { id: "offbeat",     group: "stile", emoji: "🧭",  label: "Fuori dai circuiti",   color: "#57534E", desc: "Luoghi meno battuti, borghi e chicche lontane dalle folle", icon: "offbeat" },
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
