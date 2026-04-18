/**
 * Funzioni per accedere ai dati delle venues dal database Supabase
 *
 * Ogni funzione fa una query al database e restituisce i dati.
 * Per ora le venues vengono dal database; nella Fase 1 le arricchiremo
 * con Google Places API (foto, orari aggiornati, rating).
 */

import { supabase } from './supabase'
import type { Venue, MoodType, PriceRange } from '@/types/database'

/**
 * Budget adiacenti per allargare il pool di venue e avere più varietà.
 * Es. se scegli "mid", cerchiamo anche "low" e "high" così il piano
 * cambia davvero ogni volta che clicchi "Rigenera".
 */
const ADJACENT_BUDGETS: Record<PriceRange, PriceRange[]> = {
  low:    ['low', 'mid'],
  mid:    ['low', 'mid', 'high'],
  high:   ['mid', 'high', 'luxury'],
  luxury: ['high', 'luxury'],
}

/**
 * Prende tutti i locali attivi compatibili con uno o più mood.
 * Usa .overlaps() per trovare venue che hanno ALMENO UNO dei mood selezionati.
 * Include budget adiacenti per avere un pool ampio e piani sempre diversi.
 * I venue del budget esatto vengono messi prima (boost implicito).
 */
export async function getVenuesByMoodAndBudget(
  moods: MoodType | MoodType[],
  priceRange: PriceRange
): Promise<Venue[]> {
  const budgets = ADJACENT_BUDGETS[priceRange]
  const moodArray = Array.isArray(moods) ? moods : [moods]

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .overlaps('compatible_moods', moodArray)   // match se ha ALMENO UNO dei mood
    .in('price_range', budgets)
    .eq('is_active', true)
    .order('boost_level', { ascending: false })

  if (error) {
    console.error('Errore nel caricare le venues:', error)
    return []
  }

  // Metti prima i venue del budget esatto, poi gli adiacenti
  const exact = (data ?? []).filter(v => v.price_range === priceRange)
  const others = (data ?? []).filter(v => v.price_range !== priceRange)
  return [...exact, ...others]
}

/**
 * Prende un singolo locale per id.
 * Usata nella pagina dettaglio locale (Fase 2).
 */
export async function getVenueById(id: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Errore nel caricare la venue:', error)
    return null
  }

  return data
}

/**
 * Prende tutti i locali attivi per un mood, con filtro opzionale per tipo.
 * Usata nella sezione Esplora, senza vincoli di budget.
 */
export async function getVenuesByMood(
  moodLabel: string,
  type?: string
): Promise<Venue[]> {
  const base = supabase
    .from('venues')
    .select('*')
    .overlaps('compatible_moods', [moodLabel])
    .eq('is_active', true)
    .order('boost_level', { ascending: false })

  const { data, error } = type
    ? await base.eq('type', type)
    : await base

  if (error) {
    console.error('Errore nel caricare le venues per mood:', error)
    return []
  }
  return data ?? []
}

/**
 * Cerca locali per nome o indirizzo (per la funzione di ricerca — Fase 2).
 */
export async function searchVenues(query: string): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
    .limit(20)

  if (error) {
    console.error('Errore nella ricerca venues:', error)
    return []
  }

  return data ?? []
}
