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

/** Converte i mood ID del frontend (inglese) agli ID del DB (italiano) */
const MOOD_MAP: Record<string, MoodType> = {
  romantic:  'romantico',
  adventure: 'avventuroso',
  chill:     'rilassato',
  social:    'social',
  cultural:  'culturale',
  classy:    'elegante',
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
  dopocena:  ['club', 'lounge', 'cocktail_bar', 'bar', 'attivita', 'teatro', 'cinema', 'altro'],
}

/** Orari fissi per i 3 slot della serata */
const SLOT_TIMES     = ['19:00', '20:30', '22:30']
const SLOT_DURATIONS = ['1h',    '1.5h',  '1–2h']

// ─── Titoli per mood ──────────────────────────────────────────────────────────

const MOOD_TITLES: Record<string, string[]> = {
  romantic:  ['Serata da Sogno', 'Tramonto & Sapori', 'Notte Romantica', 'Il Piano Perfetto'],
  adventure: ['Milano Segreta',  'Off the Beaten Track', 'Serata Inaspettata', 'Fuori Dagli Schemi'],
  chill:     ['Me Time a Milano','Serata Senza Fretta', 'Zero Stress',     'Slow Evening'],
  social:    ['Serata On Fire',  'Milano by Night',     'Full Energy',     'Non Si Dorme'],
  cultural:  ['Arte & Sapori',   'Cultura e Buon Vino', 'Mente & Piacere', 'Serata Ispirata'],
  classy:    ['Milano Chic',     'Eleganza Milanese',   'The Premium Night','Look Impeccabile'],
}

const MOOD_SUBTITLES: Record<string, string> = {
  romantic:  'Una serata pensata per creare momenti speciali',
  adventure: 'I posti che i milanesi non conoscono ancora',
  chill:     'Un piano rilassato, zero pensieri',
  social:    'Da aperitivo a notte fonda senza fermarsi',
  cultural:  'Cultura, sapori e qualcosa che ti resterà',
  classy:    'La serata che posterai su Instagram',
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
    time,
    type:     VENUE_TO_STEP_TYPE[venue.type] || 'drink',
    name:     venue.name,
    address:  venue.address,
    desc:     venue.description ?? `${venue.name} — perfetto per il tuo mood.`,
    img:      venue.emoji ?? '📍',
    duration,
    price:    PRICE_LABEL[venue.price_range] ?? '€ variabile',
    tip:      venue.tips ?? 'Controlla gli orari prima di andare.',
  }
}

// ─── Funzione principale ──────────────────────────────────────────────────────

/**
 * Genera un piano serata.
 *
 * 1. Chiede a Supabase i venue per quel mood + budget
 * 2. Seleziona 3 venue: aperitivo → cena → dopocena
 * 3. Li converte nel formato che PlanView si aspetta
 * 4. Fallback ai piani statici se il DB non ha abbastanza venue
 *
 * @param mood     - ID mood frontend ("romantic", "chill", ecc.)
 * @param company  - ID compagnia ("couple", "friends", ecc.)
 * @param budget   - ID budget ("low", "mid", "high", "luxury")
 */
export async function generatePlan(
  mood: string,
  company: string,
  budget: string
): Promise<Plan> {
  const italianMood = MOOD_MAP[mood]

  if (italianMood) {
    try {
      const venues = await getVenuesByMoodAndBudget(italianMood, budget as PriceRange)

      if (venues.length >= 2) {
        const usedIds = new Set<string>()

        // Slot 1 — Aperitivo
        const aperitivoVenue = pickVenue(venues, SLOT_TYPES.aperitivo, usedIds)
        if (aperitivoVenue) usedIds.add(aperitivoVenue.id)

        // Slot 2 — Cena (se non trova ristoranti, prende qualsiasi venue non ancora usato)
        const allTypes = Object.keys(VENUE_TO_STEP_TYPE)
        const cenaVenue = pickVenue(venues, SLOT_TYPES.cena, usedIds)
          ?? pickVenue(venues, allTypes, usedIds)
        if (cenaVenue) usedIds.add(cenaVenue.id)

        // Slot 3 — Dopocena (idem, fallback su tutto)
        const dopoVenue = pickVenue(venues, SLOT_TYPES.dopocena, usedIds)
          ?? pickVenue(venues, allTypes, usedIds)
        if (dopoVenue) usedIds.add(dopoVenue.id)

        const steps: PlanStep[] = []
        if (aperitivoVenue) steps.push(venueToStep(aperitivoVenue, SLOT_TIMES[0], SLOT_DURATIONS[0]))
        if (cenaVenue)      steps.push(venueToStep(cenaVenue,      SLOT_TIMES[1], SLOT_DURATIONS[1]))
        if (dopoVenue)      steps.push(venueToStep(dopoVenue,      SLOT_TIMES[2], SLOT_DURATIONS[2]))

        // Se abbiamo almeno 2 step, il piano è valido
        if (steps.length >= 2) {
          const titles = MOOD_TITLES[mood] ?? ['Serata Perfetta']
          const title  = titles[Math.floor(Math.random() * titles.length)]

          return {
            title,
            subtitle: MOOD_SUBTITLES[mood] ?? 'Un piano personalizzato per il tuo mood',
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
  return getPlan(mood, company, budget)
}
