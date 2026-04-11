import { supabase } from '@/lib/supabase'
import { MOODS, STEP_TYPE_COLORS } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Venue } from '@/types/database'
import Link from 'next/link'

/** Foto Unsplash curate per tipo di venue — nessuna API richiesta */
const VENUE_PHOTOS: Record<string, string[]> = {
  bar: [
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
    'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?w=800&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
  ],
  cocktail_bar: [
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
    'https://images.unsplash.com/photo-1527761939622-933c0a044f6e?w=800&q=80',
  ],
  rooftop: [
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
    'https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=800&q=80',
  ],
  lounge: [
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
    'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  ],
  ristorante: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80',
  ],
  trattoria: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  ],
  pizzeria: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  ],
  club: [
    'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ],
  parco: [
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  ],
  museo: [
    'https://images.unsplash.com/photo-1584967918940-a7d51b064268?w=800&q=80',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
  ],
  teatro: [
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80',
    'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=800&q=80',
  ],
  cinema: [
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
  ],
  attivita: [
    'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800&q=80',
    'https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=800&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
  ],
}

const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80',
]

/** Seleziona una foto in modo deterministico in base al nome del locale */
function getVenuePhoto(venue: Venue): string {
  // Se c'è già una foto salvata in DB, usala
  if (venue.photo_url) return venue.photo_url

  const photos = VENUE_PHOTOS[venue.type] ?? FALLBACK_PHOTOS
  // Hash semplice: somma dei char codes del nome → indice consistente
  const hash = venue.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return photos[hash % photos.length]
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

  // Foto: da DB se già salvata, altrimenti Unsplash curata per tipo venue
  const photoUrl = getVenuePhoto(venue)

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
