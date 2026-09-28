/**
 * Logo di Elly: un pin da mappa con dentro l'ago di una bussola.
 * E' l'unico simbolo ricorrente dell'app (in alto a sinistra, nel pulsante
 * centrale della barra in basso, nello splash e nell'icona dell'app).
 */

type MarkProps = {
  size?: number;
  /** Colore del pin. */
  color?: string;
  /** Colore dell'ago e dell'anello interno (di solito lo sfondo). */
  needle?: string;
  className?: string;
  title?: string;
};

export function EllyMark({ size = 24, color = "#7A3348", needle = "#FFFFFF", className, title }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path fill={color} d="M16 2C9.9 2 5 6.9 5 13c0 8.2 11 17 11 17s11-8.8 11-17C27 6.9 22.1 2 16 2z" />
      <circle cx="16" cy="13" r="7" fill="none" stroke={needle} strokeOpacity={0.55} strokeWidth={1} />
      <path fill={needle} d="M16 6.8l2.1 6.2h-4.2z" />
      <path fill={needle} fillOpacity={0.45} d="M13.9 13h4.2L16 19.2z" />
    </svg>
  );
}

/** Logo completo: simbolo + scritta "elly". */
export function EllyWordmark({ size = 24, color = "#7A3348", textColor = "#22201F" }: { size?: number; color?: string; textColor?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Elly">
      <EllyMark size={size} color={color} needle="#FBFAF7" />
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
