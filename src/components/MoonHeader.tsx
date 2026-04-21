"use client";

/**
 * MoonHeader — header cosmico riutilizzabile.
 * Mostra il glow della luna dall'alto, stelle CSS, wordmark "my mood" e il titolo della pagina.
 * Usato in Esplora, Community, Profilo, Auth.
 */

// Stelle con posizioni fisse (no Math.random → nessun problema di hydration)
const STARS = [
  { x: 8,  y: 18, s: 1.5, o: 0.55, d: 3.2, dl: 0    },
  { x: 18, y:  8, s: 1,   o: 0.45, d: 4.1, dl: 0.8  },
  { x: 31, y: 24, s: 1,   o: 0.35, d: 2.8, dl: 1.2  },
  { x: 47, y:  6, s: 2,   o: 0.25, d: 5.0, dl: 0.3  },
  { x: 62, y: 20, s: 1,   o: 0.5,  d: 3.5, dl: 1.8  },
  { x: 75, y:  9, s: 1.5, o: 0.6,  d: 4.3, dl: 0.6  },
  { x: 87, y: 22, s: 1,   o: 0.4,  d: 2.9, dl: 2.1  },
  { x: 94, y: 12, s: 1,   o: 0.5,  d: 3.7, dl: 1.0  },
  { x: 4,  y: 40, s: 1,   o: 0.3,  d: 4.5, dl: 1.5  },
  { x: 55, y: 35, s: 1.5, o: 0.35, d: 3.9, dl: 0.4  },
];

type Props = {
  title: string;
  subtitle?: string;
  city?: string;
  accentColor?: string;
  right?: React.ReactNode;
};

export default function MoonHeader({
  title,
  subtitle,
  city = "Milano",
  accentColor = "#8B5CF6",
  right,
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        paddingTop: "48px",
        paddingBottom: "20px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      {/* ── Glow della luna dall'alto ─────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: "340px",
          height: "220px",
          background: `radial-gradient(ellipse at top, ${accentColor}22 0%, ${accentColor}08 40%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Stelle ───────────────────────────────────────────── */}
      {STARS.map((star, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}px`,
            width: `${star.s}px`,
            height: `${star.s}px`,
            borderRadius: "50%",
            background: "white",
            opacity: star.o,
            animation: `twinkle ${star.d}s ease-in-out ${star.dl}s infinite alternate`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Contenuto ─────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Wordmark + città */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "13px", lineHeight: 1 }}>🌙</span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.22)",
              }}
            >
              my mood
            </span>
          </div>
          {city && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              {city}
            </span>
          )}
        </div>

        {/* Titolo + right slot */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#F5F5F0",
                letterSpacing: "-0.5px",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: "13px",
                  marginTop: "5px",
                  marginBottom: 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {right && <div style={{ flexShrink: 0 }}>{right}</div>}
        </div>
      </div>
    </div>
  );
}
