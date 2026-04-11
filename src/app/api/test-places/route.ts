import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY non trovata nelle env vars' }, { status: 500 })
  }

  try {
    // Test con la nuova Places API (v1)
    const res = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
        },
        body: JSON.stringify({
          textQuery: 'Navigli Milano',
          maxResultCount: 1,
        }),
        cache: 'no-store',
      }
    )

    const data = await res.json()
    const place = data.places?.[0]

    return NextResponse.json({
      api_status: res.status,
      found: !!place,
      place_name: place?.displayName?.text ?? null,
      place_id: place?.id ?? null,
      has_photos: !!place?.photos?.length,
      photo_name_preview: place?.photos?.[0]?.name?.slice(0, 60) + '...' ?? null,
      raw_error: data.error ?? null,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
