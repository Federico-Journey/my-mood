/**
 * Funzioni per salvare e recuperare i piani serata da Supabase
 *
 * Quando un utente genera un piano, lo salviamo nel database.
 * Questo ci permette di:
 * - Mostrare la cronologia dei piani all'utente registrato
 * - Raccogliere analytics su quali mood/budget sono più richiesti
 * - Permettere la condivisione tramite link
 */

import { supabase } from './supabase'
import type { Plan, MoodType, CompanyType, PriceRange, PlanStep } from '@/types/database'

/**
 * Salva un piano serata nel database.
 * user_id è opzionale: anche gli utenti non registrati generano piani.
 */
export async function savePlan(params: {
  mood: MoodType
  company: CompanyType
  budget: PriceRange
  title: string
  subtitle: string
  steps: PlanStep[]
  ai_generated?: boolean
  user_id?: string
}): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('plans')
    .insert({
      mood: params.mood,
      company: params.company,
      budget: params.budget,
      title: params.title,
      subtitle: params.subtitle,
      steps: params.steps,
      ai_generated: params.ai_generated ?? false,
      user_id: params.user_id ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Errore nel salvare il piano:', error)
    return null
  }

  return data
}

/**
 * Prende i piani salvati di un utente (per la pagina "I miei piani" — Fase 1).
 */
export async function getUserPlans(userId: string): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Errore nel caricare i piani utente:', error)
    return []
  }

  return data ?? []
}

/**
 * Incrementa il contatore di condivisioni di un piano.
 * Chiamata ogni volta che l'utente clicca "Condividi su WhatsApp".
 */
export async function incrementSharedCount(planId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_shared_count', { plan_id: planId })

  if (error) {
    console.error('Errore nell\'incrementare shared_count:', error)
  }
}

/**
 * Salva il rating dell'utente dopo la serata (1-5 stelle).
 */
export async function ratePlan(planId: string, rating: number): Promise<void> {
  const { error } = await supabase
    .from('plans')
    .update({ rating })
    .eq('id', planId)

  if (error) {
    console.error('Errore nel salvare il rating:', error)
  }
}
