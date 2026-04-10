/**
 * API Route: GET /api/venue-photo?name=Pavé&address=Via Felice Casati 27
 *
 * Chiama Google Places API per cercare un venue per nome e indirizzo,
 * poi restituisce la URL della prima foto disponibile.
 *
 * Richiede: GOOGLE_PLACES_API_KEY in .env.local (e su Vercel)
 *
 * Flusso:
 * 1. Text Search → trova place_id
 * 2. Place Details → ottiene photo_reference
 * 3. Restituisce URL foto (proxied o riferimento)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const venueId = searchParams.get('venue_id')
  const name = searchParams.get('name')
  const address = searchParams.get('address')

  if (!PLACES_API_KEY) {
    return NextResponse.json({ error: 'Google Places API key non configurata' }, { status: 500 })
  }

  if (!name) {
    return NextResponse.json({ error: 'Parametro name obbligatorio' }, { status: 400 })
  }

  try {
    // Step 1: Text Search per trovare il place_id
    const query = encodeURIComponent(`${name} ${address ?? ''} Milano`)
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,photos&key=${PLACES_API_KEY}`

    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()

    const candidate = searchData.candidates?.[0]
    if (!candidate) {
      return NextResponse.json({ photo_url: null }, { status: 200 })
    }

    const placeId = candidate.place_id
    const photoRef = candidate.photos?.[0]?.photo_reference

    if (!photoRef) {
      // Prova con Place Details se non ha foto dirette
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${PLACES_API_KEY}`
      const detailsRes = await fetch(detailsUrl)
      const detailsData = await detailsRes.json()
      const ref = detailsData.result?.photos?.[0]?.photo_reference
      if (!ref) return NextResponse.json({ photo_url: null }, { status: 200 })

      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ref}&key=${PLACES_API_KEY}`

      // Salva in DB se abbiamo il venue_id
      if (venueId) {
        await supabase.from('venues').update({ photo_url: photoUrl, google_place_id: placeId }).eq('id', venueId)
      }

      return NextResponse.json({ photo_url: photoUrl, place_id: placeId })
    }

    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${PLACES_API_KEY}`

    // Salva in DB se abbiamo il venue_id
    if (venueId) {
      await supabase.from('venues').update({ photo_url: photoUrl, google_place_id: placeId }).eq('id', venueId)
    }

    return NextResponse.json({ photo_url: photoUrl, place_id: placeId })

  } catch (err) {
    console.error('Places API error:', err)
    return NextResponse.json({ error: 'Errore nella chiamata a Google Places' }, { status: 500 })
  }
}
