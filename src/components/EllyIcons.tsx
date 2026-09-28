"use client";

// ══════════════════════════════════════════════════
// ELLY — Set di icone lineari (stile minimal) usate
// nelle schermate del flusso di creazione viaggio.
// ══════════════════════════════════════════════════

type IconProps = { className?: string; size?: number };

const sharedProps = (size?: number) => ({
  width: size ?? 20,
  height: size ?? 20,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function PinIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.3" />
    </svg>
  );
}

export function UsersIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.3 20c0-3.6 2.5-6 5.7-6s5.7 2.4 5.7 6" />
      <circle cx="17.2" cy="9" r="2.1" />
      <path d="M16 14c2.1.5 3.7 2.6 3.7 5" />
    </svg>
  );
}

export function CalendarIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

export function CompassIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6 6-2z" />
    </svg>
  );
}

export function WalletIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16" cy="14" r="1" />
    </svg>
  );
}

export function ChecklistIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3h6v3H9z" />
      <path d="M9 12.5l2 2 4-4.5" />
    </svg>
  );
}

export function GlobeIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z" />
    </svg>
  );
}

export function CheckIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export function MountainIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M3 19l6-10 4 6 2-3 6 7" />
    </svg>
  );
}

export function ShieldIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" />
    </svg>
  );
}

export function RoadIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M9 21L11 3M15 21L13 3" />
      <path d="M12 21V3" strokeDasharray="2 3" />
    </svg>
  );
}

export function WaveIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M2 14.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </svg>
  );
}

export function MuseumIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M4 21h16M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6" />
    </svg>
  );
}
