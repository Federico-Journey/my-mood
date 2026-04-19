/**
 * Funzioni per la sezione Community:
 * - feed di piani pubblici
 * - like/unlike
 * - invio e ricezione messaggi
 */

import { supabase } from './supabase'

export interface PublicPlan {
  id: string
  user_id: string
  mood_id: string
  accent_color: string
  plan_data: Record<string, unknown>
  title: string
  created_at: string
  is_public: boolean
  // joined
  author_name: string | null
  author_avatar: string | null
  likes_count: number
  user_liked: boolean
}

export interface PlanMessage {
  id: string
  plan_id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
  is_read: boolean
  // joined
  sender_name: string | null
  sender_avatar: string | null
  plan_title: string | null
}

/**
 * Carica i piani pubblici (feed community) con autore e numero di like.
 * `currentUserId` serve per sapere se l'utente ha già messo like.
 */
export async function fetchPublicPlans(currentUserId?: string): Promise<PublicPlan[]> {
  // Prendi i piani pubblici con i profili autore
  const { data: plans, error } = await supabase
    .from('user_plans')
    .select(`
      id, user_id, mood_id, accent_color, plan_data, title, created_at, is_public,
      profiles!user_plans_user_id_fkey(name, avatar_url)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !plans) {
    console.error('Errore nel caricare i piani pubblici:', error)
    return []
  }

  // Prendi i like di tutti i piani
  const planIds = plans.map((p) => p.id)
  const { data: likes } = await supabase
    .from('plan_likes')
    .select('plan_id, user_id')
    .in('plan_id', planIds)

  const likesMap: Record<string, number> = {}
  const userLikedSet = new Set<string>()

  for (const like of likes ?? []) {
    likesMap[like.plan_id] = (likesMap[like.plan_id] ?? 0) + 1
    if (currentUserId && like.user_id === currentUserId) {
      userLikedSet.add(like.plan_id)
    }
  }

  return plans.map((p) => {
    const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
    return {
      id: p.id,
      user_id: p.user_id,
      mood_id: p.mood_id,
      accent_color: p.accent_color,
      plan_data: p.plan_data as Record<string, unknown>,
      title: p.title,
      created_at: p.created_at,
      is_public: p.is_public,
      author_name: (profile as { name?: string } | null)?.name ?? null,
      author_avatar: (profile as { avatar_url?: string } | null)?.avatar_url ?? null,
      likes_count: likesMap[p.id] ?? 0,
      user_liked: userLikedSet.has(p.id),
    }
  })
}

/**
 * Mette o toglie un like a un piano.
 * Restituisce il nuovo stato (true = like aggiunto, false = rimosso).
 */
export async function toggleLike(planId: string, userId: string, alreadyLiked: boolean): Promise<boolean> {
  if (alreadyLiked) {
    await supabase
      .from('plan_likes')
      .delete()
      .eq('plan_id', planId)
      .eq('user_id', userId)
    return false
  } else {
    await supabase
      .from('plan_likes')
      .insert({ plan_id: planId, user_id: userId })
    return true
  }
}

/**
 * Invia un messaggio all'autore di un piano.
 */
export async function sendPlanMessage(
  planId: string,
  senderId: string,
  receiverId: string,
  message: string
): Promise<boolean> {
  const { error } = await supabase.from('plan_messages').insert({
    plan_id: planId,
    sender_id: senderId,
    receiver_id: receiverId,
    message,
  })
  return !error
}

/**
 * Carica la inbox dell'utente (messaggi ricevuti e inviati),
 * raggruppati per piano e interlocutore.
 */
export async function fetchMyMessages(userId: string): Promise<PlanMessage[]> {
  const { data, error } = await supabase
    .from('plan_messages')
    .select(`
      id, plan_id, sender_id, receiver_id, message, created_at, is_read,
      sender:profiles!plan_messages_sender_id_fkey(name, avatar_url),
      plan:user_plans!plan_messages_plan_id_fkey(title)
    `)
    .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Errore nel caricare i messaggi:', error)
    return []
  }

  return data.map((m) => {
    const sender = Array.isArray(m.sender) ? m.sender[0] : m.sender
    const plan = Array.isArray(m.plan) ? m.plan[0] : m.plan
    return {
      id: m.id,
      plan_id: m.plan_id,
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
      message: m.message,
      created_at: m.created_at,
      is_read: m.is_read,
      sender_name: (sender as { name?: string } | null)?.name ?? null,
      sender_avatar: (sender as { avatar_url?: string } | null)?.avatar_url ?? null,
      plan_title: (plan as { title?: string } | null)?.title ?? null,
    }
  })
}

/**
 * Marca tutti i messaggi ricevuti dall'utente come letti.
 */
export async function markMessagesRead(userId: string): Promise<void> {
  await supabase
    .from('plan_messages')
    .update({ is_read: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)
}

/**
 * Conta i messaggi non letti per l'utente (usato per badge nella NavBar).
 */
export async function countUnreadMessages(userId: string): Promise<number> {
  const { count } = await supabase
    .from('plan_messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)
  return count ?? 0
}
