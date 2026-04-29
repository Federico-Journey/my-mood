import { supabase } from '@/lib/supabase'
import { MOODS, STEP_TYPE_COLORS } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Venue } from '@/types/database'
import Link from 'next/link'
import VenueHeroImage from '@/components/VenueHeroImage'
import PhotoCarousel from '@/components/PhotoCarousel'
import FavoriteButton from '@/components/FavoriteButton'

function getVenuePhotoSrc(venue: Venue): string {
  if (venue.photo_url) return venue.photo_url
  if (venue.google_place_id)
    return `/api/place-photo?place_id=${encodeURIComponent(venue.google_place_id)}`
  return `/api/place-photo?name=${encodeURIComponent(venue.name)}`
}

type Props = { params: Promise<{ id: string }> }

const VENUE_TYPE_LABEL: Record<string, string> = {
  bar: 'Bar', cocktail_bar: 'Cocktail Bar', rooftop: 'Rooftop',
  lounge: 'Lounge', ristorante: 'Ristorante', trattoria: 'Trattoria',
  pizzeria: 'Pizzeria', club: 'Club', parco: 'Parco', museo: 'Museo',
  teatro: 'Teatro', cinema: 'Cinema', attivita: 'Attività', altro: 'Locale',
}
const PRICE_LABEL: Record<string, string> = {
  low: '€ · Sotto i 30€', mid: '€€ · 30–60€',
  high: '€€€ · 60–100€', luxury: '€€€€ · Oltre 100€',
}
const VENUE_TO_STEP_TYPE: Record<string, string> = {
  bar: 'aperitivo', cocktail_bar: 'aperitivo', rooftop: 'aperitivo',
  lounge: 'drink', ristorante: 'cena', trattoria: 'cena', pizzeria: 'cena',
  club: 'serata', parco: 'passeggiata', museo: 'cultura', teatro: 'musica',
  cinema: 'relax', attivita: 'esperienza', altro: 'drink',
}

export default async function VenuePage({ params }: Props) {
  const { id } = await params

  // Fetch venue
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()
  const venue = data as Venue

  // Fetch business account collegato (se esiste)
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, description, phone, website, instagram, is_verified, plan')
    .eq('venue_id', id)
    .single()

  // Fetch foto business
  let businessPhotos: string[] = []
  if (business) {
    const { data: photos } = await supabase
      .from('business_photos')
      .select('url')
      .eq('business_id', business.id)
      .order('order_index')
    businessPhotos = photos?.map(p => p.url) ?? []
  }

  const isPartner = !!business
  const accentColor = STEP_TYPE_COLORS[VENUE_TO_STEP_TYPE[venue.type]] ?? '#8B5CF6'
  const fallbackEmoji = venue.emoji ?? '📍'
  const photoSrc = getVenuePhotoSrc(venue)

  // Se business ha foto → carousel, altrimenti hero singola
  const hasCarousel = businessPhotos.length > 0

  const moodObjects = MOODS.filter(m =>
    venue.compatible_moods?.includes(m.id as never) ||
    venue.compatible_moods?.some((cm: string) => {
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

  // Descrizione: preferisce quella del business se più ricca
  const description = business?.description || venue.description

  // Contatti: preferisce quelli del business
  const phone = business?.phone
  const website = business?.website || venue.website_url
  const instagram = business?.instagram

  return (
    <main style={{ minHeight: '100vh', background: '#09090f', fontFamily: '"DM Sans", -apple-system, sans-serif' }}>

      {/* Hero — carousel se business, altrimenti foto singola */}
      <div style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
        {hasCarousel ? (
          <PhotoCarousel
            photos={businessPhotos}
            venueName={venue.name}
            fallbackEmoji={fallbackEmoji}
            accentColor={accentColor}
          />
        ) : (
          <div style={{ width: '100%', height: '280px', position: 'relative', overflow: 'hidden' }}>
            <VenueHeroImage
              src={photoSrc}
              alt={venue.name}
              fallbackEmoji={fallbackEmoji}
              accentColor={accentColor}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
              background: 'linear-gradient(to top, #09090f, transparent)',
            }} />
          </div>
        )}

        {/* Back button */}
        <Link href="javascript:history.back()" style={{
          position: 'absolute', top: '16px', left: '16px',
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: '100px',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)',
        }}>
          ← Torna
        </Link>
      </div>

      {/* Contenuto */}
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 20px 80px' }}>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px', marginBottom: '12px' }}>
          {isPartner && (
            <span style={{
              borderRadius: '100px', padding: '5px 12px', fontSize: '12px', fontWeight: 700,
              background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
              color: '#FCD34D',
            }}>
              ⭐ Partner My Mood
            </span>
          )}
          <span style={{
            borderRadius: '100px', padding: '5px 12px', fontSize: '12px', fontWeight: 700,
            background: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor,
          }}>
            {VENUE_TYPE_LABEL[venue.type] ?? 'Locale'}
          </span>
          <span style={{
            borderRadius: '100px', padding: '5px 12px', fontSize: '12px',
            color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {PRICE_LABEL[venue.price_range] ?? '€'}
          </span>
          {venue.google_rating && (
            <span style={{
              borderRadius: '100px', padding: '5px 12px', fontSize: '12px',
              color: '#FBBF24', background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
            }}>
              ★ {venue.google_rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Nome + cuore */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0, flex: 1 }}>
            {venue.name}
          </h1>
          <FavoriteButton venueId={venue.id} size="lg" />
        </div>

        {/* Indirizzo */}
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          color: 'rgba(255,255,255,0.4)', fontSize: '14px',
          textDecoration: 'none', marginBottom: '24px',
        }}>
          📍 {venue.address}, Milano
          <span style={{ fontSize: '11px', opacity: 0.6 }}>↗</span>
        </a>

        {/* Divider */}
        <div style={{ height: '1px', background: `linear-gradient(to right, ${accentColor}30, transparent)`, marginBottom: '24px' }} />

        {/* Descrizione */}
        {description && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 10px' }}>
              Il Posto
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.65, margin: 0 }}>
              {description}
            </p>
          </div>
        )}

        {/* Tip */}
        {venue.tips && (
          <div style={{
            borderRadius: '16px', padding: '16px',
            background: `${accentColor}0a`, border: `1px solid ${accentColor}18`,
            marginBottom: '24px',
          }}>
            <p style={{ color: `${accentColor}cc`, fontSize: '14px', margin: 0, lineHeight: 1.55 }}>
              <span style={{ fontWeight: 700 }}>💡 Tip:</span> {venue.tips}
            </p>
          </div>
        )}

        {/* Contatti business */}
        {(phone || instagram) && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 12px' }}>
              Contatti
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {phone && (
                <a href={`tel:${phone}`} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none',
                }}>
                  📞 {phone}
                </a>
              )}
              {instagram && (
                <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none',
                }}>
                  📸 {instagram}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Mood compatibili */}
        {moodObjects.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 10px' }}>
              Perfetto per
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {moodObjects.map(m => (
                <span key={m.id} style={{
                  borderRadius: '100px', padding: '5px 12px', fontSize: '12px', fontWeight: 600,
                  background: `${m.color}15`, border: `1px solid ${m.color}30`, color: m.color,
                }}>
                  {m.emoji} {m.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '16px', borderRadius: '18px',
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
              boxShadow: `0 4px 24px ${accentColor}30`,
              color: '#fff', fontWeight: 700, fontSize: '15px', textDecoration: 'none',
            }}>
              🌐 Visita il sito
            </a>
          )}
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '15px', borderRadius: '18px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '15px', textDecoration: 'none',
          }}>
            📍 Apri su Google Maps
          </a>
          <Link href="/genera" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px', borderRadius: '18px',
            color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontSize: '14px', textDecoration: 'none',
          }}>
            🌙 Genera un nuovo piano
          </Link>
        </div>
      </div>
    </main>
  )
}
