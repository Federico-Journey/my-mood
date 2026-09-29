/**
 * Intestazioni da aggiungere alle chiamate verso le nostre route API, cosi'
 * il server sa chi e' l'utente (vedi src/lib/supabaseServer.ts).
 * Per gli ospiti restituisce solo il Content-Type.
 */

import { supabase } from "./supabase";

export async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  return headers;
}
