import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, created_at')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Raggruppa per nome (case-insensitive)
  const groups: Record<string, typeof data> = {}
  for (const v of data ?? []) {
    const key = v.name.trim().toLowerCase()
    if (!groups[key]) groups[key] = []
    groups[key].push(v)
  }

  const duplicates = Object.entries(groups)
    .filter(([, items]) => items.length > 1)
    .map(([name, items]) => ({
      name,
      count: items.length,
      ids: items.map(i => ({ id: i.id, created_at: i.created_at })),
    }))

  return NextResponse.json({
    total_venues: data?.length ?? 0,
    unique_names: Object.keys(groups).length,
    duplicates_found: duplicates.length,
    duplicates,
  })
}
