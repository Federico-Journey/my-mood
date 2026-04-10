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
 * Prende tutti i locali attivi per un certo mood e budget.
 * Usata per costruire il piano serata.
 */
export async function getVenuesByMoodAndBudget(
  mood: MoodType,
  priceRange: PriceRange
): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .contains('compatible_moods', [mood])
    .eq('price_range', priceRange)
    .eq('is_active', true)
    .order('boost_level', { ascending: false }) // i locali partner appaiono prima

  if (error) {
    console.error('Errore nel caricare le venues:', error)
    return []
  }

  return data ?? []
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
