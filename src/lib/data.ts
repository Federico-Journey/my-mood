// ══════════════════════════════════════════════════
// MY MOOD — Static Data (will be replaced by Supabase + AI in Phase 1)
// ══════════════════════════════════════════════════

export type Mood = {
  id: string;
  emoji: string;
  label: string;
  color: string;
  desc: string;
};

export type Company = {
  id: string;
  emoji: string;
  label: string;
};

export type Budget = {
  id: string;
  label: string;
  desc: string;
};

export type PlanStep = {
  venue_id?: string;  // UUID Supabase — presente solo nei piani generati da DB
  time: string;
  type: string;
  name: string;
  address: string;
  desc: string;
  img: string;
  duration: string;
  price: string;
  tip: string;
};

export type Plan = {
  title: string;
  subtitle: string;
  steps: PlanStep[];
};

export const MOODS: Mood[] = [
  // — Originali —
  { id: "romantic",    emoji: "🌹", label: "Romantico",    color: "#E8456B", desc: "Cena intima, luci soffuse, momenti speciali" },
  { id: "adventure",   emoji: "⚡", label: "Avventuroso",  color: "#F59E0B", desc: "Posti nuovi, esperienze uniche, fuori dagli schemi" },
  { id: "chill",       emoji: "🌊", label: "Rilassato",    color: "#06B6D4", desc: "Atmosfera tranquilla, buon cibo, zero stress" },
  { id: "social",      emoji: "🎉", label: "Social",       color: "#8B5CF6", desc: "Energia alta, tanta gente, divertimento puro" },
  { id: "cultural",    emoji: "🎭", label: "Culturale",    color: "#EC4899", desc: "Arte, musica live, esperienze che arricchiscono" },
  { id: "classy",      emoji: "🥂", label: "Elegante",     color: "#A78BFA", desc: "Cocktail bar, fine dining, look impeccabile" },
  // — Nuovi —
  { id: "foodie",      emoji: "🍽️", label: "Foodie",       color: "#F97316", desc: "Scoprire cucine nuove, chef creativi, sapori inaspettati" },
  { id: "nightlife",   emoji: "🌙", label: "Nottambulo",   color: "#4F46E5", desc: "Club, DJ set, ballare fino all'alba" },
  { id: "sporty",      emoji: "🏃", label: "Sportivo",     color: "#10B981", desc: "Post-gym, post-padel, energia da sfogare" },
  { id: "creative",    emoji: "🎨", label: "Creativo",     color: "#FBBF24", desc: "Workshop, gallerie, fare qualcosa con le mani" },
  { id: "alternative", emoji: "🎸", label: "Alternativo",  color: "#84CC16", desc: "Indie, underground, fuori dai circuiti soliti" },
  { id: "zen",         emoji: "🌿", label: "Zen",          color: "#14B8A6", desc: "Ritmo lento, niente notifiche, benessere" },
  { id: "musical",     emoji: "🎵", label: "Musicale",     color: "#9333EA", desc: "Jazz live, concerti, musica dal vivo" },
  { id: "indulgent",   emoji: "🤤", label: "Godereccio",   color: "#EF4444", desc: "Pizza, street food, abbondanza, birre artigianali" },
  { id: "coffee",      emoji: "☕", label: "Coffee Lover", color: "#D97706", desc: "Specialty coffee, colazioni lunghe, rituale della tazza" },
  { id: "mystery",     emoji: "🔮", label: "Misterioso",   color: "#7C3AED", desc: "Speakeasy, posti segreti, esperienze inaspettate" },
  { id: "aperitivo",   emoji: "🍹", label: "Aperitivo",    color: "#FB923C", desc: "Il rito milanese per eccellenza, quello perfetto" },
  { id: "party",       emoji: "🎊", label: "Festivo",      color: "#F43F5E", desc: "Compleanno, promozione, si festeggia grande" },
  { id: "vintage",     emoji: "🎩", label: "Vintage",      color: "#B45309", desc: "Bar storici, vecchia Milano, atmosfera d'altri tempi" },
  { id: "exclusive",   emoji: "💎", label: "Esclusivo",    color: "#818CF8", desc: "Members' club, rooftop privati, mi merito qualcosa di speciale" },
];

export const COMPANIES: Company[] = [
  { id: "couple", emoji: "\u{1F491}", label: "In coppia" },
  { id: "friends", emoji: "\u{1F465}", label: "Con amici" },
  { id: "solo", emoji: "\u{1F680}", label: "Da solo/a" },
  { id: "group", emoji: "\u{1F38A}", label: "Gruppo grande" },
];

export const BUDGETS: Budget[] = [
  { id: "low", label: "\u20AC", desc: "Sotto i 30\u20AC" },
  { id: "mid", label: "\u20AC\u20AC", desc: "30-60\u20AC" },
  { id: "high", label: "\u20AC\u20AC\u20AC", desc: "60-100\u20AC" },
  { id: "luxury", label: "\u20AC\u20AC\u20AC\u20AC", desc: "Senza limiti" },
];

export const PLANS: Record<string, Plan> = {
  "romantic-couple-mid": {
    title: "Tramonto & Sapori",
    subtitle: "Una serata romantica tra i Navigli e Brera",
    steps: [
      { time: "19:00", type: "aperitivo", name: "Terrazza Aperol", address: "Piazza del Duomo, 1", desc: "Aperitivo con vista mozzafiato sul Duomo al tramonto. Spritz e tagliere per iniziare la serata.", img: "\u{1F379}", duration: "1h", price: "\u20AC15-20 a testa", tip: "Arriva 10 min prima per prendere il tavolo con vista migliore" },
      { time: "20:30", type: "cena", name: "Osteria del Binari", address: "Via Tortona, 1", desc: "Cucina lombarda autentica in un'ex stazione ferroviaria. Atmosfera intima con luci calde e mattoni a vista.", img: "\u{1F35D}", duration: "1.5h", price: "\u20AC25-35 a testa", tip: "Prova il risotto alla milanese \u2014 \u00E8 il migliore della zona" },
      { time: "22:30", type: "drink", name: "Backdoor 43", address: "Ripa di Porta Ticinese, 43", desc: "Speakeasy nascosto dietro una porta segreta. Cocktail d'autore in un ambiente intimo con massimo 20 posti.", img: "\u{1F378}", duration: "1-2h", price: "\u20AC12-16 a cocktail", tip: "Prenota \u2014 \u00E8 piccolo e si riempie. Chiedi del cocktail del giorno" }
    ]
  },
  "romantic-couple-high": {
    title: "Notte da Favola",
    subtitle: "Fine dining e cocktail esclusivi nel cuore di Milano",
    steps: [
      { time: "19:30", type: "aperitivo", name: "Ceresio 7", address: "Via Ceresio, 7", desc: "Rooftop con piscina e skyline di Milano. Cocktail sofisticati in un'atmosfera da film.", img: "\u{1F942}", duration: "1h", price: "\u20AC18-25 a testa", tip: "Prenota il tavolo poolside per l'esperienza completa" },
      { time: "21:00", type: "cena", name: "Contraste", address: "Via Meda, 2", desc: "Una stella Michelin, menu degustazione che racconta l'Italia attraverso piatti sorprendenti.", img: "\u2728", duration: "2h", price: "\u20AC80-120 a testa", tip: "Prendi il wine pairing \u2014 vale ogni euro" },
      { time: "23:30", type: "drink", name: "1930 Speakeasy", address: "Via Amedei, 8", desc: "Il cocktail bar segreto pi\u00F9 famoso di Milano. Serve solo 30 persone, atmosfera anni '30.", img: "\u{1F3A9}", duration: "1-2h", price: "\u20AC15-20 a cocktail", tip: "Password per entrare: cercala sul loro Instagram il giorno stesso" }
    ]
  },
  "adventure-friends-mid": {
    title: "Milano Segreta",
    subtitle: "I posti che i milanesi non conoscono",
    steps: [
      { time: "18:30", type: "attivit\u00E0", name: "Fondazione Prada \u2014 Torre", address: "Largo Isarco, 2", desc: "Il bar progettato da Wes Anderson al 5\u00B0 piano. S\u00EC, hai letto bene. Design surreale, drink assurdi.", img: "\u{1F3A8}", duration: "1h", price: "\u20AC10-15 a testa", tip: "Fai foto ovunque \u2014 ogni angolo \u00E8 instagrammabile" },
      { time: "20:00", type: "cena", name: "Mercato Comunale", address: "Via Casale (Isola)", desc: "Street food gourmet nel quartiere pi\u00F9 cool di Milano. Ogni banco \u00E8 un viaggio diverso.", img: "\u{1F32E}", duration: "1.5h", price: "\u20AC15-25 a testa", tip: "Ognuno prende qualcosa di diverso e condividete tutto" },
      { time: "22:00", type: "esperienza", name: "Spirit de Milan", address: "Via Bovisasca, 59", desc: "Ex fabbrica trasformata in balera con swing dal vivo, cocktail e balli. Atmosfera unica.", img: "\u{1F483}", duration: "2-3h", price: "\u20AC10-15 ingresso + drink", tip: "Il gioved\u00EC c'\u00E8 lezione di swing gratuita prima della serata" }
    ]
  },
  "social-friends-mid": {
    title: "Serata On Fire",
    subtitle: "Da aperitivo a notte fonda senza fermarsi",
    steps: [
      { time: "19:00", type: "aperitivo", name: "Botanical Club", address: "Via Pastrengo, 11", desc: "Cocktail botanici in un giardino nascosto nel cuore di Isola. Vibes tropicali e musica lounge.", img: "\u{1F33F}", duration: "1.5h", price: "\u20AC12-15 a cocktail", tip: "Il giardino interno \u00E8 magico \u2014 puntate l\u00EC" },
      { time: "20:30", type: "cena", name: "Bros Milano", address: "Via Solferino, 33", desc: "Cucina pugliese contemporanea. Piatti da condividere, porzioni generose, atmosfera conviviale.", img: "\u{1F355}", duration: "1.5h", price: "\u20AC25-35 a testa", tip: "Ordinate il burratone e ringraziatemi dopo" },
      { time: "22:30", type: "serata", name: "Apollo Club", address: "Via Borsieri, 20", desc: "Club intimo con DJ set, musica house e techno. La pista si riempie dopo mezzanotte.", img: "\u{1F3A7}", duration: "fino a tardi", price: "\u20AC10-15 ingresso", tip: "Arrivate entro le 23 per evitare la coda" }
    ]
  },
  "chill-solo-low": {
    title: "Me Time a Milano",
    subtitle: "Una serata tutta per te, zero fretta",
    steps: [
      { time: "18:00", type: "passeggiata", name: "Parco Sempione", address: "Piazza Sempione", desc: "Passeggiata al tramonto tra il Castello Sforzesco e l'Arco della Pace. Porta le cuffie.", img: "\u{1F305}", duration: "45min", price: "Gratis", tip: "Il punto migliore per il tramonto \u00E8 vicino al laghetto" },
      { time: "19:30", type: "cena", name: "Taglio", address: "Via Vigevano, 10", desc: "Tagliere gourmet e calice di vino naturale. Perfetto per sedersi al bancone e godersi il momento.", img: "\u{1F9C0}", duration: "1h", price: "\u20AC15-25", tip: "Il bancone \u00E8 il posto migliore \u2014 chiacchieri col barman" },
      { time: "21:00", type: "relax", name: "Cinema Beltrade", address: "Via Nino Oxilia, 10", desc: "Cinema indipendente con film d'autore, poltrone comodissime e bar interno.", img: "\u{1F3AC}", duration: "2h", price: "\u20AC6-8", tip: "Controlla la programmazione \u2014 spesso hanno rassegne tematiche" }
    ]
  },
  "cultural-couple-mid": {
    title: "Arte & Note",
    subtitle: "Cultura, sapori e musica dal vivo",
    steps: [
      { time: "18:00", type: "cultura", name: "Mudec \u2014 Museo delle Culture", address: "Via Tortona, 56", desc: "Mostre temporanee sempre sorprendenti in uno spazio architettonico mozzafiato.", img: "\u{1F3DB}\uFE0F", duration: "1.5h", price: "\u20AC12-15 a testa", tip: "Il gioved\u00EC sera apertura prolungata fino alle 22:30" },
      { time: "20:00", type: "cena", name: "Erba Brusca", address: "Alzaia Naviglio Pavese, 286", desc: "Farm-to-table con orto proprio. Cucina creativa in un cascinale lungo il Naviglio.", img: "\u{1F331}", duration: "1.5h", price: "\u20AC30-40 a testa", tip: "Prenota il tavolo nel giardino \u2014 d'estate \u00E8 magico" },
      { time: "22:00", type: "musica", name: "Blue Note Milano", address: "Via Borsieri, 37", desc: "Il tempio del jazz a Milano. Concerti dal vivo ogni sera, atmosfera internazionale.", img: "\u{1F3B7}", duration: "2h", price: "\u20AC20-35 ingresso", tip: "Prendi i posti al balconcino per la vista migliore sul palco" }
    ]
  },
  "classy-friends-high": {
    title: "Milano Chic",
    subtitle: "La serata che posterai su Instagram",
    steps: [
      { time: "19:00", type: "aperitivo", name: "Bulgari Hotel \u2014 Il Bar", address: "Via Privata Fratelli Gabba, 7b", desc: "Cocktail nel giardino privato del Bulgari. Eleganza pura nel cuore di Brera.", img: "\u{1F48E}", duration: "1h", price: "\u20AC22-30 a cocktail", tip: "Dress code smart casual \u2014 no sneakers" },
      { time: "20:30", type: "cena", name: "Nobu Milano", address: "Via Pisoni, 1", desc: "Cucina giapponese-peruviana nel ristorante di De Niro. Black cod miso obbligatorio.", img: "\u{1F363}", duration: "2h", price: "\u20AC60-90 a testa", tip: "Il tavolo nella sala principale \u00E8 dove succede tutto" },
      { time: "23:00", type: "drink", name: "Armani/Bamboo Bar", address: "Via Manzoni, 31", desc: "Cocktail bar dell'Armani Hotel. Design impeccabile, drink perfetti, clientela internazionale.", img: "\u{1F5A4}", duration: "1-2h", price: "\u20AC20-28 a cocktail", tip: "Il live music set del weekend \u00E8 imperdibile" }
    ]
  }
};

export const DEFAULT_PLAN: Plan = {
  title: "Serata Perfetta",
  subtitle: "Un piano personalizzato per il tuo mood",
  steps: [
    { time: "19:00", type: "aperitivo", name: "Navigli Walk & Drink", address: "Alzaia Naviglio Grande", desc: "Passeggiata lungo i Navigli con sosta aperitivo in uno dei tanti locali affacciati sull'acqua.", img: "\u{1F377}", duration: "1h", price: "\u20AC10-15", tip: "I locali sul lato sinistro hanno la luce migliore al tramonto" },
    { time: "20:30", type: "cena", name: "Trattoria Milanese", address: "Via Santa Marta, 11", desc: "Cucina tradizionale milanese dal 1933. Cotoletta, risotto, ossobuco \u2014 i classici fatti bene.", img: "\u{1F958}", duration: "1.5h", price: "\u20AC25-35 a testa", tip: "La cotoletta alla milanese \u00E8 la migliore della citt\u00E0" },
    { time: "22:30", type: "dopo cena", name: "Fonderie Milanesi", address: "Via Giovenale, 7", desc: "Ex fonderia industriale trasformata in cocktail bar. Atmosfera industrial-chic unica.", img: "\u{1F525}", duration: "1-2h", price: "\u20AC10-14 a cocktail", tip: "Il cortile interno d'estate \u00E8 il posto dove stare" }
  ]
};

export const STEP_TYPE_COLORS: Record<string, string> = {
  aperitivo: "#F59E0B",
  cena: "#EF4444",
  drink: "#8B5CF6",
  "attivit\u00E0": "#06B6D4",
  passeggiata: "#10B981",
  relax: "#6366F1",
  cultura: "#EC4899",
  musica: "#A78BFA",
  esperienza: "#F97316",
  serata: "#E11D48",
  "dopo cena": "#9333EA",
};

export function getPlan(mood: string, company: string, budget: string): Plan {
  const key = `${mood}-${company}-${budget}`;
  return PLANS[key] || PLANS[`${mood}-${company}-mid`] || PLANS[`${mood}-friends-mid`] || DEFAULT_PLAN;
}
