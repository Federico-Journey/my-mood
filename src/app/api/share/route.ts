import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { moodId, accentColor, planData } = body

    if (!moodId || !accentColor || !planData) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('shared_plans')
      .insert({
        mood_id: moodId,
        accent_color: accentColor,
        plan_data: planData,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
