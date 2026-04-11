import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY non trovata nelle env vars' }, { status: 500 })
  }

  try {
    // Test con la vecchia Places API (findplacefromtext)
    const query = encodeURIComponent('Navigli Milano')
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,photos,name&key=${apiKey}`

    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    const candidate = data.candidates?.[0]

    return NextResponse.json({
      status: data.status,
      error_message: data.error_message ?? null,
      found: !!candidate,
      name: candidate?.name ?? null,
      place_id: candidate?.place_id ?? null,
      has_photos: !!candidate?.photos?.length,
      photo_ref_preview: candidate?.photos?.[0]?.photo_reference
        ? candidate.photos[0].photo_reference.slice(0, 50) + '...'
        : null,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
