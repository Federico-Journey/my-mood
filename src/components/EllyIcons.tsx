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

export function ClockIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
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

export function RouteIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)} strokeWidth={1.1}>
      <path d="M3 19c2.5-.3 3.2-2.4 5-3.6 2.2-1.5 3.4.6 5.6-.3 2-.8 2-3 4-4.3" strokeDasharray="0.2 3.2" />
      <circle cx="8" cy="15.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="15.1" r="1" fill="currentColor" stroke="none" />
      <path d="M17.6 6.5a3 3 0 116 0c0 2.2-3 5-3 5s-3-2.8-3-5z" />
      <circle cx="20.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ForkKnifeIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M9 3v6a2 2 0 004 0V3M11 9v12" />
    </svg>
  );
}

export function GlassIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M5 5h14l-7 8v6M9 19h6" />
    </svg>
  );
}

export function ObeliskIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M9 21V9l3-6 3 6v12" />
    </svg>
  );
}

export function LeafIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M6 20c0-8 4-14 12-16-1 9-4 14-12 16z" />
      <path d="M8 18c2-4 5-8 9-11" />
    </svg>
  );
}

export function MoonIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M14 3.5A7.5 7.5 0 1020.5 14 6 6 0 0114 3.5z" />
    </svg>
  );
}

export function BagIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </svg>
  );
}

export function BedIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <rect x="3" y="12" width="18" height="7" rx="1.5" />
      <path d="M3 12V9a1.5 1.5 0 011.5-1.5h4A1.5 1.5 0 0110 9v3" />
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

export function BellIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <path d="M6 16v-5a6 6 0 0112 0v5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 004 0" />
    </svg>
  );
}

export function GearIcon({ className, size }: IconProps) {
  return (
    <svg className={className} {...sharedProps(size)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  );
}
