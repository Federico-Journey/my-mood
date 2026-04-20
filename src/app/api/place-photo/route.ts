/**
 * API Route: /api/place-photo?place_id=ChIJ...
 *
 * Proxy sicuro per le foto di Google Places.
 * La GOOGLE_PLACES_API_KEY rimane solo lato server — non viene mai esposta al client.
 *
 * Flusso:
 * 1. Riceve il place_id di Google
 * 2. Chiama Places API v1 per ottenere il nome della prima foto
 * 3. Chiama l'endpoint media per ottenere la photoUri (URL reale su lh3.googleusercontent.com)
 * 4. Fa redirect 302 verso quell'URL — il browser (o <img>) lo segue automaticamente
 *
 * Cache in memoria (per istanza server) per ridurre le chiamate all'API Google.
 */

import { NextRequest, NextResponse } from 'next/server'

// Cache semplice in memoria: place_id → photoUri
// Dura finché il server è in esecuzione (si svuota a ogni deploy, ma è sufficiente)
const photoCache = new Map<string, string>()

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get('place_id')

  if (!placeId) {
    return NextResponse.json({ error: 'Parametro place_id mancante' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY non configurata')
    return NextResponse.json({ error: 'API key non configurata' }, { status: 500 })
  }

  // Cache hit: ritorna direttamente il redirect senza chiamare Google
  const cached = photoCache.get(placeId)
  if (cached) {
    return NextResponse.redirect(cached)
  }

  try {
    // ── Step 1: ottieni i metadati delle foto del posto ──────────────────────
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${apiKey}`
    const detailsRes = await fetch(detailsUrl, {
      headers: { 'Content-Type': 'application/json' },
      // Cache la risposta per 24 ore a livello di fetch di Next.js
      next: { revalidate: 86400 },
    })

    if (!detailsRes.ok) {
      const errText = await detailsRes.text()
      console.error(`Places API details error (${detailsRes.status}):`, errText)
      return NextResponse.json({ error: 'Errore Places API' }, { status: 502 })
    }

    const details = await detailsRes.json()
    const photoName: string | undefined = details.photos?.[0]?.name

    if (!photoName) {
      return NextResponse.json({ error: 'Nessuna foto trovata per questo posto' }, { status: 404 })
    }

    // ── Step 2: ottieni la photoUri dalla risorsa media ──────────────────────
    // skipHttpRedirect=true → risponde con JSON { photoUri: "https://lh3..." }
    const mediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true&key=${apiKey}`
    const mediaRes = await fetch(mediaUrl, {
      next: { revalidate: 86400 },
    })

    if (!mediaRes.ok) {
      const errText = await mediaRes.text()
      console.error(`Places Photo media error (${mediaRes.status}):`, errText)
      return NextResponse.json({ error: 'Errore foto media' }, { status: 502 })
    }

    const mediaData = await mediaRes.json()
    const photoUri: string | undefined = mediaData.photoUri

    if (!photoUri) {
      return NextResponse.json({ error: 'photoUri non trovata nella risposta' }, { status: 404 })
    }

    // ── Salva in cache e fai redirect ────────────────────────────────────────
    photoCache.set(placeId, photoUri)

    return NextResponse.redirect(photoUri)
  } catch (err) {
    console.error('Errore inatteso in /api/place-photo:', err)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
