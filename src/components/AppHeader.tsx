"use client";

/**
 * Intestazione delle pagine principali: logo a sinistra, impostazioni
 * (ingranaggio) e notifiche (campanella) a destra.
 */

import Link from "next/link";
import { ELLY_COLORS } from "@/lib/travelData";
import { EllyWordmark } from "@/components/EllyLogo";
import { BellIcon, GearIcon } from "@/components/EllyIcons";

const C = ELLY_COLORS;

function RoundLink({ href, label, badge, children }: { href: string; label: string; badge?: number; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative w-9 h-9 rounded-full flex items-center justify-center"
      style={{ background: C.bgElev, border: `1px solid ${C.border}`, color: C.text }}
    >
      {children}
      {!!badge && badge > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9.5px] font-bold flex items-center justify-center"
          style={{ background: C.accent, color: "#fff" }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

export default function AppHeader({ notificationCount = 0 }: { notificationCount?: number }) {
  return (
    <header
      className="flex items-center justify-between pt-4 pb-2"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
    >
      <Link href="/" aria-label="Elly, vai alla home">
        <EllyWordmark size={24} />
      </Link>
      <div className="flex items-center gap-2">
        <RoundLink href="/impostazioni" label="Impostazioni">
          <GearIcon size={17} />
        </RoundLink>
        <RoundLink href="/notifiche" label="Notifiche" badge={notificationCount}>
          <BellIcon size={17} />
        </RoundLink>
      </div>
    </header>
  );
}
