/**
 * Tipi TypeScript per il database Supabase
 *
 * Questi tipi descrivono la struttura delle tabelle del database.
 * TypeScript li usa per:
 * - Autocompletamento quando scrivi codice (es. venue.name)
 * - Errori in fase di sviluppo se usi un campo sbagliato
 * - Documentazione "vivente" della struttura dati
 */

// ============================================
// VENUES — Locali e attività
// ============================================
export type VenueType =
  | 'bar'
  | 'ristorante'
  | 'club'
  | 'lounge'
  | 'pizzeria'
  | 'trattoria'
  | 'cocktail_bar'
  | 'rooftop'
  | 'parco'
  | 'museo'
  | 'teatro'
  | 'cinema'
  | 'attivita'
  | 'altro'

export type PriceRange = 'low' | 'mid' | 'high' | 'luxury'

export type MoodType =
  | 'romantico'
  | 'avventuroso'
  | 'rilassato'
  | 'social'
  | 'culturale'
  | 'elegante'
  | 'foodie'
  | 'nottambulo'
  | 'sportivo'
  | 'creativo'
  | 'alternativo'
  | 'zen'
  | 'musicale'
  | 'godereccio'
  | 'coffeelover'
  | 'misterioso'
  | 'aperitivo'
  | 'festivo'
  | 'vintage'
  | 'esclusivo'

export interface Venue {
  id: string
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  type: VenueType
  price_range: PriceRange
  compatible_moods: MoodType[]
  description: string | null
  tips: string | null
  emoji: string | null
  google_place_id: string | null
  google_rating: number | null
  opening_hours: Record<string, unknown>
  images: string[]
  is_active: boolean
  is_partner: boolean
  boost_level: number
  created_at: string
  updated_at: string
}

// ============================================
// PROFILES — Profili utente
// ============================================
export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  interests: string[]
  favorite_moods: MoodType[]
  default_budget: PriceRange | null
  is_premium: boolean
  premium_until: string | null
  created_at: string
  updated_at: string
}

// ============================================
// PLANS — Piani serata
// ============================================

/** Un singolo step del piano (un locale con orario) */
export interface PlanStep {
  venue_id?: string
  venue_name: string
  venue_address: string
  venue_emoji: string
  time: string
  duration: string
  estimated_cost: string
  description: string
  tip?: string
  type: 'aperitivo' | 'cena' | 'dopocena' | 'attivita' | 'altro'
}

export type CompanyType = 'coppia' | 'amici' | 'solo' | 'gruppo'

export interface Plan {
  id: string
  user_id: string | null
  mood: MoodType
  company: CompanyType
  budget: PriceRange
  title: string
  subtitle: string | null
  steps: PlanStep[]
  ai_generated: boolean
  shared_count: number
  rating: number | null
  created_at: string
}
