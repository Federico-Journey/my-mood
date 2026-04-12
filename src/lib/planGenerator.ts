/**
 * Piano Generator — Phase 1
 *
 * Questo file è il "cervello" che costruisce un piano serata.
 * Interroga Supabase per trovare i venue reali a Milano,
 * li seleziona in base al mood/budget, e li assembla in un piano.
 *
 * Se il DB non risponde (o non trova abbastanza venue),
 * fa automaticamente fallback ai piani statici in data.ts.
 */

import { getVenuesByMoodAndBudget } from './venues'
import { getPlan, type Plan, type PlanStep } from './data'
import type { Venue, MoodType, PriceRange } from '@/types/database'

// ─── Mappature ───────────────────────────────────────────────────────────────

/** Converte i mood ID del frontend agli ID del DB (italiano) */
const MOOD_MAP: Record<string, MoodType> = {
  romantic:    'romantico',
  adventure:   'avventuroso',
  chill:       'rilassato',
  social:      'social',
  cultural:    'culturale',
  classy:      'elegante',
  foodie:      'foodie',
  nightlife:   'nottambulo',
  sporty:      'sportivo',
  creative:    'creativo',
  alternative: 'alternativo',
  zen:         'zen',
  musical:     'musicale',
  indulgent:   'godereccio',
  coffee:      'coffeelover',
  mystery:     'misterioso',
  aperitivo:   'aperitivo',
  party:       'festivo',
  vintage:     'vintage',
  exclusive:   'esclusivo',
}

/** Converte il tipo di venue al tipo di step (per i colori in PlanView) */
const VENUE_TO_STEP_TYPE: Record<string, string> = {
  bar:         'aperitivo',
  cocktail_bar:'aperitivo',
  rooftop:     'aperitivo',
  lounge:      'drink',
  ristorante:  'cena',
  trattoria:   'cena',
  pizzeria:    'cena',
  club:        'serata',
  parco:       'passeggiata',
  museo:       'cultura',
  teatro:      'musica',
  cinema:      'relax',
  attivita:    'esperienza',
  altro:       'drink',
}

/** Etichette prezzo per la UI */
const PRICE_LABEL: Record<string, string> = {
  low:    '€10–20 a testa',
  mid:    '€25–40 a testa',
  high:   '€50–80 a testa',
  luxury: '€80+ a testa',
}

/** Quali tipi di venue vanno in quale slot della serata */
const SLOT_TYPES = {
  aperitivo: ['bar', 'cocktail_bar', 'rooftop', 'lounge'],
  cena:      ['ristorante', 'trattoria', 'pizzeria'],
  dopocena:  ['club', 'lounge', 'cocktail_bar', 'bar', 'attivita', 'altro'],
  club:      ['club'],
  outdoor:   ['parco', 'attivita'],
  cultura:   ['museo', 'teatro', 'cinema'],
}

/** Definizione di uno slot nel piano */
type SlotDef = {
  types: string[]
  fallbackTypes: string[]
  time: string
  duration: string
}

/** Mappa ActivityMode → sequenza di slot da costruire */
const ACTIVITY_SLOTS: Record<string, SlotDef[]> = {
  aperitivo: [
    { types: SLOT_TYPES.aperitivo, fallbackTypes: SLOT_TYPES.dopocena, time: '19:00', duration: '2h' },
  ],
  cena: [
    { types: SLOT_TYPES.cena, fallbackTypes: SLOT_TYPES.aperitivo, time: '20:00', duration: '2h' },
  ],
  aperitivo_cena: [
    { types: SLOT_TYPES.aperitivo, fallbackTypes: SLOT_TYPES.dopocena, time: '19:00', duration: '1h' },
    { types: SLOT_TYPES.cena,      fallbackTypes: SLOT_TYPES.aperitivo, time: '20:30', duration: '1.5h' },
  ],
  cena_dopocena: [
    { types: SLOT_TYPES.cena,     fallbackTypes: SLOT_TYPES.aperitivo, time: '20:00', duration: '1.5h' },
    { types: SLOT_TYPES.dopocena, fallbackTypes: SLOT_TYPES.aperitivo, time: '22:00', duration: '2h' },
  ],
  serata_completa: [
    { types: SLOT_TYPES.aperitivo, fallbackTypes: SLOT_TYPES.dopocena, time: '19:00', duration: '1h' },
    { types: SLOT_TYPES.cena,      fallbackTypes: SLOT_TYPES.aperitivo, time: '20:30', duration: '1.5h' },
    { types: SLOT_TYPES.dopocena,  fallbackTypes: SLOT_TYPES.aperitivo, time: '22:30', duration: '2h' },
  ],
  ballare: [
    { types: SLOT_TYPES.aperitivo, fallbackTypes: SLOT_TYPES.dopocena, time: '19:30', duration: '1h' },
    { types: SLOT_TYPES.cena,      fallbackTypes: SLOT_TYPES.aperitivo, time: '21:00', duration: '1.5h' },
    { types: SLOT_TYPES.club,      fallbackTypes: SLOT_TYPES.dopocena,  time: '23:00', duration: '2h+' },
  ],
  outdoor: [
    { types: SLOT_TYPES.outdoor,  fallbackTypes: SLOT_TYPES.aperitivo, time: '18:00', duration: '2h' },
    { types: SLOT_TYPES.cena,     fallbackTypes: SLOT_TYPES.dopocena,  time: '20:30', duration: '1.5h' },
  ],
  cultura: [
    { types: SLOT_TYPES.cultura,  fallbackTypes: SLOT_TYPES.outdoor,  time: '18:30', duration: '2h' },
    { types: SLOT_TYPES.cena,     fallbackTypes: SLOT_TYPES.aperitivo, time: '21:00', duration: '1.5h' },
  ],
}

/** Slot di default (serata completa) se activities non è specificato */
const DEFAULT_SLOTS: SlotDef[] = ACTIVITY_SLOTS.serata_completa

// ─── Titoli per mood ──────────────────────────────────────────────────────────

const MOOD_TITLES: Record<string, string[]> = {
  romantic:    ['Serata da Sogno',     'Tramonto & Sapori',    'Notte Romantica',      'Il Piano Perfetto'],
  adventure:   ['Milano Segreta',      'Off the Beaten Track', 'Serata Inaspettata',   'Fuori Dagli Schemi'],
  chill:       ['Me Time a Milano',    'Serata Senza Fretta',  'Zero Stress',          'Slow Evening'],
  social:      ['Serata On Fire',      'Milano by Night',      'Full Energy',          'Non Si Dorme'],
  cultural:    ['Arte & Sapori',       'Cultura e Buon Vino',  'Mente & Piacere',      'Serata Ispirata'],
  classy:      ['Milano Chic',         'Eleganza Milanese',    'The Premium Night',    'Look Impeccabile'],
  foodie:      ['Giro Gourmand',       'Sapori di Milano',     'Il Percorso del Gusto','Una Serata da Chef'],
  nightlife:   ['Non Si Dorme',        'Milano dopo Mezzanotte','Full Night Mode',     'La Notte è Giovane'],
  sporty:      ['Energy Mode ON',      'Post-Match Vibes',     'Endorfine & Spritz',   'Active Evening'],
  creative:    ['Serata Creativa',     'Hands On',             'Workshop & Wine',      'Arte & Aperitivo'],
  alternative: ['Off the Grid',        'La Milano che non sai','Underground Vibes',    'Fuori dal Coro'],
  zen:         ['Slow Down',           'Respira',              'Zero Notifiche',       'The Quiet Evening'],
  musical:     ['Notte in Musica',     'Live & Loud',          'Jazz & Cocktail',      'Sound & Soul'],
  indulgent:   ['No Dieta Stasera',    'Full Godimento',       'Pizza & Birra Mode',   'Si Mangia'],
  coffee:      ['Coffee Run Milano',   'Specialty Morning',    'Il Giro dei Caffè',    'Brew & Go'],
  mystery:     ['Milano Nascosta',     'Speakeasy Night',      'Segreti & Cocktail',   'Il Posto Segreto'],
  aperitivo:   ['L\'Aperitivo Perfetto','Golden Hour Milano',  'Sunset Spritz',        'Ora di Aperitivo'],
  party:       ['Si Festeggia!',       'Grande Serata',        'Party Mode',           'Notte da Ricordare'],
  vintage:     ['Vecchia Milano',      'La Milano di una Volta','Stile d\'Epoca',      'Classici Senza Tempo'],
  exclusive:   ['VIP Mode',           'L\'Esclusiva Milanese', 'Serata Speciale',      'Il Meglio di Milano'],
}

const MOOD_SUBTITLES: Record<string, string> = {
  romantic:    'Una serata pensata per creare momenti speciali',
  adventure:   'I posti che i milanesi non conoscono ancora',
  chill:       'Un piano rilassato, zero pensieri',
  social:      'Da aperitivo a notte fonda senza fermarsi',
  cultural:    'Cultura, sapori e qualcosa che ti resterà',
  classy:      'La serata che posterai su Instagram',
  foodie:      'Un viaggio gastronomico nel cuore di Milano',
  nightlife:   'La notte milanese inizia adesso',
  sporty:      'Scarichi l\'adrenalina, poi si celebra',
  creative:    'Ispirazione, mani in pasta e un buon drink',
  alternative: 'Milano fuori dai circuiti soliti',
  zen:         'Stacca, rallenta, goditi il momento',
  musical:     'Le note migliori della città, stasera per te',
  indulgent:   'Niente sensi di colpa, solo piacere',
  coffee:      'Il culto della tazza perfetta a Milano',
  mystery:     'Posti che non trovi su Google Maps',
  aperitivo:   'Il rito milanese per eccellenza, quello vero',
  party:       'Perché alcune serate meritano di essere leggendarie',
  vintage:     'La Milano autentica, quella degli anni d\'oro',
  exclusive:   'Ti meriti qualcosa di fuori dall\'ordinario',
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Mescola un array in modo casuale (per dare piani diversi a ogni rigenerazione) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Sceglie un venue random tra quelli del tipo giusto, escludendo quelli già usati */
function pickVenue(venues: Venue[], types: string[], usedIds: Set<string>): Venue | null {
  const candidates = shuffle(venues).filter(
    v => types.includes(v.type) && !usedIds.has(v.id)
  )
  return candidates[0] ?? null
}

/** Converte un Venue del DB nello step che PlanView si aspetta */
function venueToStep(venue: Venue, time: string, duration: string): PlanStep {
  return {
    venue_id: venue.id,
    time,
    type:     VENUE_TO_STEP_TYPE[venue.type] || 'drink',
    name:     venue.name,
    address:  venue.address,
    desc:     venue.description ?? `${venue.name} — perfetto per il tuo mood.`,
    img:      venue.emoji ?? '\u{1F4CD}',
    duration,
    price:    PRICE_LABEL[venue.price_range] ?? '\u20AC variabile',
    tip:      venue.tips ?? 'Controlla gli orari prima di andare.',
  }
}

// ─── Funzione principale ──────────────────────────────────────────────────────

/**
 * Genera un piano serata.
 *
 * 1. Chiede a Supabase i venue per quel mood + budget
 * 2. Filtra per quartiere (se specificato), con fallback su tutti i quartieri
 * 3. Seleziona i venue per ogni slot in base alle attività scelte dall'utente
 * 4. Li converte nel formato che PlanView si aspetta
 * 5. Fallback ai piani statici se il DB non ha abbastanza venue
 *
 * @param mood         - ID mood frontend ("romantic", "chill", ecc.)
 * @param company      - ID compagnia ("couple", "friends", ecc.)
 * @param budget       - ID budget ("low", "mid", "high", "luxury")
 * @param activities   - Cosa vuole fare l'utente ("serata_completa", "ballare", ecc.)
 * @param neighborhood - Quartiere preferito ("navigli", "brera", ecc. — "anywhere" = nessun filtro)
 */
export async function generatePlan(
  moods: string | string[],
  company: string,
  budget: string,
  activities?: string,
  neighborhood?: string
): Promise<Plan> {
  // Supporta sia singolo mood (retrocompatibilità) che array
  const moodArray = Array.isArray(moods) ? moods : [moods]
  const primaryMood = moodArray[0]  // usato per titoli e fallback statico

  // Converti tutti i mood in italiano per la query al DB
  const italianMoods = moodArray
    .map(m => MOOD_MAP[m])
    .filter(Boolean) as import('@/types/database').MoodType[]

  const slots = (activities && ACTIVITY_SLOTS[activities]) ? ACTIVITY_SLOTS[activities] : DEFAULT_SLOTS
  const allTypes = Object.keys(VENUE_TO_STEP_TYPE)
  const filterByZone = neighborhood && neighborhood !== 'anywhere'

  if (italianMoods.length > 0) {
    try {
      const venues = await getVenuesByMoodAndBudget(italianMoods, budget as PriceRange)

      if (venues.length >= 1) {
        // Se l'utente ha scelto un quartiere specifico, prova prima con quei venue
        // Se non bastano (< numero di slot), usa tutti i venue come fallback
        const zonedVenues = filterByZone
          ? venues.filter(v => v.neighborhood === neighborhood)
          : venues
        const poolToUse = (filterByZone && zonedVenues.length < slots.length)
          ? venues       // fallback su tutti i quartieri
          : zonedVenues

        const usedIds = new Set<string>()
        const steps: PlanStep[] = []

        for (const slot of slots) {
          // Prima cerca nel pool filtrato per quartiere
          let venue = pickVenue(poolToUse, slot.types, usedIds)
            ?? pickVenue(poolToUse, slot.fallbackTypes, usedIds)
            ?? pickVenue(poolToUse, allTypes, usedIds)

          // Se non trova nulla nel pool zonato, allarga a tutti i venue
          if (!venue && filterByZone) {
            venue = pickVenue(venues, slot.types, usedIds)
              ?? pickVenue(venues, slot.fallbackTypes, usedIds)
              ?? pickVenue(venues, allTypes, usedIds)
          }

          if (venue) {
            usedIds.add(venue.id)
            steps.push(venueToStep(venue, slot.time, slot.duration))
          }
        }

        // Piano valido se ha almeno 1 step
        if (steps.length >= 1) {
          const titles = MOOD_TITLES[primaryMood] ?? ['Serata Perfetta']
          const title  = titles[Math.floor(Math.random() * titles.length)]

          return {
            title,
            subtitle: MOOD_SUBTITLES[primaryMood] ?? 'Un piano personalizzato per il tuo mood',
            steps,
          }
        }
      }
    } catch (err) {
      console.error('[MyMood] Errore nel generare il piano da Supabase:', err)
    }
  }

  // Fallback: piano statico da data.ts (sempre funziona)
  console.log('[MyMood] Fallback ai piani statici')
  return getPlan(primaryMood, company, budget)
}
