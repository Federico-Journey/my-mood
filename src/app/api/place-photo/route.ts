/**
 * API Route: /api/place-photo
 *
 * Due modalità:
 * A) ?place_id=ChIJ...              → usa direttamente il place_id di Google
 * B) ?name=Nome+Locale&city=Milano  → Text Search per trovare il posto e la foto
 *
 * Flusso modalità B (la più usata — le venue non hanno place_id nel DB):
 * 1. POST /places:searchText con name + city → ottieni photos[0].name
 * 2. GET /{photo_name}/media?skipHttpRedirect=true → ottieni photoUri
 * 3. Redirect 302 verso la photoUri
 */

import { NextRequest, NextResponse } from 'next/server'

// Cache in memoria: chiave → photoUri (chiave = place_id oppure "name|city")
const photoCache = new Map<string, string>()

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const placeId   = searchParams.get('place_id')
  const name      = searchParams.get('name')
  const city      = searchParams.get('city') ?? 'Milano'

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key non configurata' }, { status: 500 })
  }

  // Determina la cache key
  const cacheKey = placeId ?? `${name}|${city}`
  if (!placeId && !name) {
    return NextResponse.json({ error: 'Fornisci place_id oppure name' }, { status: 400 })
  }

  // Cache hit
  const cached = photoCache.get(cacheKey)
  if (cached) {
    return NextResponse.redirect(cached)
  }

  try {
    let photoName: string | undefined

    if (placeId) {
      // ── Modalità A: place_id diretto ──────────────────────────────────────
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?key=${apiKey}`,
        {
          headers: { 'X-Goog-FieldMask': 'photos' },
          next: { revalidate: 86400 },
        }
      )
      if (!res.ok) {
        const err = await res.text()
        console.error(`Places details error ${res.status}:`, err)
        return NextResponse.json({ error: 'Places API error', detail: err }, { status: 502 })
      }
      const data = await res.json()
      photoName = data.photos?.[0]?.name

    } else {
      // ── Modalità B: Text Search per nome ─────────────────────────────────
      // Una sola chiamata POST che restituisce direttamente le foto
      const query = `${name} ${city}`
      const res = await fetch(
        `https://places.googleapis.com/v1/places:searchText?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'places.photos',   // chiedi solo le foto, più economico
          },
          body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
          next: { revalidate: 86400 },
        }
      )
      if (!res.ok) {
        const err = await res.text()
        console.error(`Text Search error ${res.status}:`, err)
        return NextResponse.json({ error: 'Text Search error', detail: err }, { status: 502 })
      }
      const data = await res.json()
      photoName = data.places?.[0]?.photos?.[0]?.name
    }

    if (!photoName) {
      return NextResponse.json({ error: 'Nessuna foto trovata' }, { status: 404 })
    }

    // ── Ottieni la photoUri reale ──────────────────────────────────────────
    const mediaRes = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    )
    if (!mediaRes.ok) {
      const err = await mediaRes.text()
      console.error(`Photo media error ${mediaRes.status}:`, err)
      return NextResponse.json({ error: 'Photo media error', detail: err }, { status: 502 })
    }

    const mediaData = await mediaRes.json()
    const photoUri: string | undefined = mediaData.photoUri

    if (!photoUri) {
      return NextResponse.json({ error: 'photoUri assente' }, { status: 404 })
    }

    photoCache.set(cacheKey, photoUri)
    return NextResponse.redirect(photoUri)

  } catch (err) {
    console.error('Errore in /api/place-photo:', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
