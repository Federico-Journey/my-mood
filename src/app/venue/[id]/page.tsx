import { supabase } from '@/lib/supabase'
import { MOODS, STEP_TYPE_COLORS } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Venue } from '@/types/database'
import Link from 'next/link'

/** Recupera foto reale via Google Places API (New) — server-side */
async function fetchPlacesPhoto(venue: Venue): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null
  try {
    // Step 1: Text Search (New Places API) per trovare place_id e foto
    const searchRes = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.photos',
        },
        body: JSON.stringify({
          textQuery: `${venue.name} ${venue.address} Milano`,
          maxResultCount: 1,
          languageCode: 'it',
        }),
        next: { revalidate: 86400 }, // cache 24h
      }
    )

    const searchData = await searchRes.json()
    const place = searchData.places?.[0]
    if (!place) return null

    const placeId = place.id
    const photoName = place.photos?.[0]?.name // es. "places/ChIJ.../photos/..."
    if (!photoName) return null

    // Step 2: costruisci URL diretto per la foto
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`

    // Aggiorna il DB in background (fire and forget)
    supabase.from('venues').update({ photo_url: photoUrl, google_place_id: placeId }).eq('id', venue.id).then(() => {})

    return photoUrl
  } catch {
    return null
  }
}

type Props = {
  params: Promise<{ id: string }>
}

const VENUE_TYPE_LABEL: Record<string, string> = {
  bar:          'Bar',
  cocktail_bar: 'Cocktail Bar',
  rooftop:      'Rooftop',
  lounge:       'Lounge',
  ristorante:   'Ristorante',
  trattoria:    'Trattoria',
  pizzeria:     'Pizzeria',
  club:         'Club',
  parco:        'Parco',
  museo:        'Museo',
  teatro:       'Teatro',
  cinema:       'Cinema',
  attivita:     'Attività',
  altro:        'Locale',
}

const PRICE_LABEL: Record<string, string> = {
  low:    '€ · Sotto i 30€',
  mid:    '€€ · 30–60€',
  high:   '€€€ · 60–100€',
  luxury: '€€€€ · Oltre 100€',
}

const VENUE_TO_STEP_TYPE: Record<string, string> = {
  bar:         'aperitivo',
  cocktail_bar:'aperitivo',
  rooftop:     'aperitivo',
  lounge:      'drink',
  ristorante:  'cena',
  trattoria:   'cena',
  pizzeria:    'cena',
  club:        'serata',
  parco:       'passeggiata',
  museo:       'cultura',
  teatro:      'musica',
  cinema:      'relax',
  attivita:    'esperienza',
  altro:       'drink',
}

export default async function VenuePage({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const venue = data as Venue

  // Se non abbiamo la foto in DB, la recuperiamo da Google Places (e la salviamo per la prossima volta)
  let photoUrl = venue.photo_url
  if (!photoUrl) {
    photoUrl = await fetchPlacesPhoto(venue)
  }

  const accentColor = STEP_TYPE_COLORS[VENUE_TO_STEP_TYPE[venue.type]] ?? '#8B5CF6'
  const moodObjects = MOODS.filter(m => venue.compatible_moods?.includes(m.id as never) ||
    venue.compatible_moods?.some((cm: string) => {
      // mappa mood italiano → id frontend
      const MAP: Record<string, string> = {
        romantico: 'romantic', avventuroso: 'adventure', rilassato: 'chill',
        social: 'social', culturale: 'cultural', elegante: 'classy',
        foodie: 'foodie', nottambulo: 'nightlife', sportivo: 'sporty',
        creativo: 'creative', alternativo: 'alternative', zen: 'zen',
        musicale: 'musical', godereccio: 'indulgent', coffeelover: 'coffee',
        misterioso: 'mystery', aperitivo: 'aperitivo', festivo: 'party',
        vintage: 'vintage', esclusivo: 'exclusive',
      }
      return MAP[cm] === m.id
    })
  )

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + venue.address + ' Milano')}`

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#09090f',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Hero — foto o placeholder gradiente */}
      <div
        style={{
          width: '100%',
          height: '280px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={venue.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${accentColor}30, #09090f)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '72px',
            }}
          >
            {venue.emoji ?? '📍'}
          </div>
        )}

        {/* Overlay sfumatura in basso */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(to top, #09090f, transparent)',
          }}
        />

        {/* Back button */}
        <Link
          href="/"
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '100px',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          ← Torna
        </Link>
      </div>

      {/* Contenuto */}
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          padding: '0 20px 60px',
        }}
      >
        {/* Badges tipo + prezzo */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px', marginBottom: '12px' }}>
          <span
            style={{
              borderRadius: '100px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 700,
              background: `${accentColor}20`,
              border: `1px solid ${accentColor}40`,
              color: accentColor,
            }}
          >
            {VENUE_TYPE_LABEL[venue.type] ?? 'Locale'}
          </span>
          <span
            style={{
              borderRadius: '100px',
              padding: '5px 12px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {PRICE_LABEL[venue.price_range] ?? '€'}
          </span>
          {venue.google_rating && (
            <span
              style={{
                borderRadius: '100px',
                padding: '5px 12px',
                fontSize: '12px',
                color: '#FBBF24',
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.2)',
              }}
            >
              ★ {venue.google_rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Nome */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
            margin: '0 0 6px',
          }}
        >
          {venue.name}
        </h1>

        {/* Indirizzo */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: '24px',
          }}
        >
          📍 {venue.address}, Milano
          <span style={{ fontSize: '11px', opacity: 0.6 }}>↗</span>
        </a>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: `linear-gradient(to right, ${accentColor}30, transparent)`,
            marginBottom: '24px',
          }}
        />

        {/* Descrizione */}
        {venue.description && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 10px' }}>
              Il Posto
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '15px',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {venue.description}
            </p>
          </div>
        )}

        {/* Tip */}
        {venue.tips && (
          <div
            style={{
              borderRadius: '16px',
              padding: '16px',
              background: `${accentColor}0a`,
              border: `1px solid ${accentColor}18`,
              marginBottom: '24px',
            }}
          >
            <p style={{ color: `${accentColor}cc`, fontSize: '14px', margin: 0, lineHeight: 1.55 }}>
              <span style={{ fontWeight: 700 }}>💡 Tip:</span> {venue.tips}
            </p>
          </div>
        )}

        {/* Mood compatibili */}
        {moodObjects.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 10px' }}>
              Perfetto per
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {moodObjects.map(m => (
                <span
                  key={m.id}
                  style={{
                    borderRadius: '100px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: `${m.color}15`,
                    border: `1px solid ${m.color}30`,
                    color: m.color,
                  }}
                >
                  {m.emoji} {m.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {venue.website_url && (
            <a
              href={venue.website_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '18px',
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                boxShadow: `0 4px 24px ${accentColor}30`,
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
              }}
            >
              🌐 Visita il sito
            </a>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '15px',
              borderRadius: '18px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 600,
              fontSize: '15px',
              textDecoration: 'none',
            }}
          >
            📍 Apri su Google Maps
          </a>

          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              borderRadius: '18px',
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            🌙 Genera un nuovo piano
          </Link>
        </div>
      </div>
    </main>
  )
}
