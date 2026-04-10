import { supabase } from '@/lib/supabase'
import { MOODS, STEP_TYPE_COLORS, type Plan } from '@/lib/data'
import { notFound } from 'next/navigation'

// Step type colors fallback
const TYPE_COLORS: Record<string, string> = STEP_TYPE_COLORS

type Props = {
  params: Promise<{ id: string }>
}

export default async function SharePage({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabase
    .from('shared_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const plan = data.plan_data as Plan
  const moodId = data.mood_id as string
  const accentColor = data.accent_color as string
  const selectedMood = MOODS.find((m) => m.id === moodId)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#09090f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 20px 48px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Glow bg */}
      <div
        style={{
          position: 'fixed',
          top: '-30vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '28px',
          }}
        >
          <span style={{ fontSize: '16px' }}>🌙</span>
          <span
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '11px',
              letterSpacing: '3px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            my mood
          </span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: '34px',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.5px',
              lineHeight: 1.15,
              margin: '0 0 8px',
            }}
          >
            {plan.title}
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.38)',
              fontSize: '14px',
              margin: '0 0 16px',
              lineHeight: 1.5,
            }}
          >
            {plan.subtitle}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
              {selectedMood?.emoji} {selectedMood?.label}
            </span>
            <span
              style={{
                borderRadius: '100px',
                padding: '5px 12px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              📍 Milano
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: `linear-gradient(to right, ${accentColor}30, transparent)`,
            marginBottom: '24px',
          }}
        />

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {plan.steps.map((step, i) => {
            const typeColor = TYPE_COLORS[step.type] || accentColor

            return (
              <div
                key={i}
                style={{
                  borderRadius: '20px',
                  padding: '18px',
                  background: `linear-gradient(135deg, ${typeColor}08, rgba(255,255,255,0.02))`,
                  border: `1px solid ${typeColor}20`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Left accent bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '3px',
                    height: '100%',
                    background: `linear-gradient(to bottom, ${typeColor}, ${typeColor}40)`,
                    borderRadius: '3px 0 0 3px',
                  }}
                />

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  {/* Icon */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      background: `${typeColor}14`,
                      border: `1px solid ${typeColor}25`,
                      flexShrink: 0,
                    }}
                  >
                    {step.img}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Time + Name row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        style={{
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '15px',
                          lineHeight: 1.3,
                        }}
                      >
                        {step.name}
                      </span>
                      <span
                        style={{
                          color: typeColor,
                          fontWeight: 700,
                          fontSize: '12px',
                          flexShrink: 0,
                          opacity: 0.85,
                        }}
                      >
                        {step.time}
                      </span>
                    </div>

                    {/* Address + price */}
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '12px',
                        margin: '0 0 8px',
                      }}
                    >
                      📍 {step.address} · 💰 {step.price}
                    </p>

                    {/* Description */}
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '13px',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <a
          href="https://my-mood-eight.vercel.app"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '16px',
            borderRadius: '18px',
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
            boxShadow: `0 4px 28px ${accentColor}35`,
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          🌙 Genera il tuo piano
        </a>

        <p
          style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          my-mood-eight.vercel.app
        </p>
      </div>
    </main>
  )
}
