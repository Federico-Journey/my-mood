/**
 * Client Supabase per le route API (lato server) che agisce A NOME
 * dell'utente che ha fatto la richiesta.
 *
 * Perche' serve: le regole del database (RLS) permettono di leggere e
 * modificare un viaggio con proprietario solo al proprietario stesso.
 * Il client "generico" di src/lib/supabase.ts, usato lato server, non sa
 * chi sia l'utente: per il database e' un ospite. Risultato: quando un
 * utente loggato generava un viaggio, il salvataggio falliva (niente
 * tripId -> spariscono "Salva" e il PDF), e le modifiche via chat ai suoi
 * viaggi non venivano salvate.
 *
 * Il browser manda il token di sessione nell'intestazione
 * "Authorization: Bearer <token>" (vedi src/lib/authHeaders.ts); qui lo
 * verifichiamo con Supabase e creiamo un client che lo usa per ogni query.
 * L'id utente viene dal token verificato, mai dal corpo della richiesta.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function makeClient(token?: string): SupabaseClient {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
}

export async function supabaseForRequest(request: Request): Promise<{ db: SupabaseClient; userId: string | null }> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return { db: makeClient(), userId: null };

  const anon = makeClient();
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) {
    // Token scaduto o non valido: procediamo come ospite invece di fallire.
    return { db: anon, userId: null };
  }
  return { db: makeClient(token), userId: data.user.id };
}
