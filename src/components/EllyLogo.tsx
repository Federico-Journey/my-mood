/**
 * Logo di Elly: un pin da mappa con dentro una rosa dei venti a quattro punte,
 * con il Nord in ambra ("Rosa dei venti", proposta A).
 * È il simbolo ricorrente dell'app: in alto a sinistra, nel pulsante centrale della
 * barra in basso e nello splash. L'icona sul telefono invece è la "E" (public/icon-*.png).
 */

export const ELLY_AMBER = "#F3A34F";

type MarkProps = {
  size?: number;
  /** Colore del pin. */
  color?: string;
  /** Colore della stella ritagliata (di solito lo sfondo). */
  needle?: string;
  /** Colore della punta Nord. */
  accent?: string;
  /** Anima la stella (usato nello splash). */
  animated?: boolean;
  className?: string;
  title?: string;
};

export function EllyMark({
  size = 24, color = "#7A3348", needle = "#FFFFFF", accent = ELLY_AMBER, animated = false, className, title,
}: MarkProps) {
  const star = animated ? { className: "elly-mark-star", style: { transformBox: "view-box" as const, transformOrigin: "32px 27px" } } : {};
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path fill={color} d="M32 4C19.3 4 9 14.3 9 27c0 16.5 23 33 23 33s23-16.5 23-33C55 14.3 44.7 4 32 4z" />
      <g {...star}>
        <path fill={needle} d="M32 11L35.2 23.8L48 27L35.2 30.2L32 43L28.8 30.2L16 27L28.8 23.8Z" />
        <path fill={accent} d="M32 11L35.2 23.8L32 27L28.8 23.8Z" />
      </g>
      <circle cx="32" cy="27" r="2.2" fill={color} />
    </svg>
  );
}

/** Logo completo: simbolo + scritta "elly". */
export function EllyWordmark({ size = 24, color = "#7A3348", textColor = "#22201F" }: { size?: number; color?: string; textColor?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Elly">
      <EllyMark size={Math.round(size * 1.1)} color={color} needle="#FBFAF7" />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: Math.round(size * 0.9),
          letterSpacing: "-0.02em",
          color: textColor,
          lineHeight: 1,
        }}
      >
        elly
      </span>
    </span>
  );
}
