import SharePageClient from './SharePageClient'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Plan } from '@/lib/data'

type Props = { params: Promise<{ id: string }> }

export default async function SharePage({ params }: Props) {
  const { id } = await params
  const { data, error } = await supabase.from('shared_plans').select('*').eq('id', id).single()
  if (error || !data) notFound()

  const { data: votes } = await supabase
    .from('plan_votes')
    .select('voter_name, response')
    .eq('share_id', id)
    .order('created_at', { ascending: true })

  return (
    <SharePageClient
      shareId={id}
      plan={data.plan_data as Plan}
      moodId={data.mood_id as string}
      accentColor={data.accent_color as string}
      initialVotes={votes ?? []}
    />
  )
}
