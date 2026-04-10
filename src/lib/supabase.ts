/**
 * Supabase Client per My Mood
 *
 * Questo file crea la connessione tra la nostra app Next.js e Supabase.
 *
 * Come funziona:
 * - createClient() crea un "client" = un oggetto che sa come parlare con Supabase
 * - Usa due variabili d'ambiente (NEXT_PUBLIC_...) che contengono l'URL del progetto
 *   e la chiave pubblica. "NEXT_PUBLIC" significa che sono accessibili anche dal browser.
 * - Il client viene creato una sola volta e riusato ovunque nell'app (pattern "singleton")
 *
 * Uso tipico:
 *   import { supabase } from '@/lib/supabase'
 *   const { data } = await supabase.from('venues').select('*')
 */

import { createClient } from '@supabase/supabase-js'

// Queste variabili vengono lette dal file .env.local
// NEXT_PUBLIC_ = disponibili sia lato server che lato browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Crea il client Supabase con supporto auth.
// flowType: 'implicit' = il token torna nel hash dell'URL dopo OAuth,
// gestito interamente dal browser senza bisogno di un callback server.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
    detectSessionInUrl: true,
    persistSession: true,
  }
})
