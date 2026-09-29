"use client";

/**
 * Barra di navigazione in basso ("capsula flottante", proposta N1): staccata dal bordo,
 * icone + parole, voce attiva con sfondo vino tenue e, al centro, il pulsante rialzato
 * con il logo che avvia la generazione di un nuovo viaggio.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ELLY_COLORS } from "@/lib/travelData";
import { EllyMark } from "@/components/EllyLogo";

const C = ELLY_COLORS;

type IconName = "home" | "board" | "trips" | "me";

function NavIcon({ name }: { name: IconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...common}>
      {name === "home" && <path d="M4 11.2L12 4.8l8 6.4V19a1 1 0 0 1-1 1h-4v-5.5H9V20H5a1 1 0 0 1-1-1z" />}
      {name === "board" && (<><rect x="4" y="4" width="16" height="16" rx="3.5" /><path d="M4 10h16M11 10v10" /></>)}
      {name === "trips" && (<><rect x="4" y="8" width="16" height="11.5" rx="2.5" /><path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8M9 12.5v3M15 12.5v3" /></>)}
      {name === "me" && (<><circle cx="12" cy="9" r="3.6" /><path d="M5 19.5c1.3-3.3 4-5 7-5s5.7 1.7 7 5" /></>)}
    </svg>
  );
}

const LEFT: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/bacheca", label: "Bacheca", icon: "board" },
];
const RIGHT: { href: string; label: string; icon: IconName }[] = [
  { href: "/viaggi", label: "Viaggi", icon: "trips" },
  { href: "/profilo", label: "Profilo", icon: "me" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function Tab({ href, label, icon, active }: { href: string; label: string; icon: IconName; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="flex flex-col items-center justify-center gap-0.5 h-[50px] mx-1 rounded-[14px] text-[10.5px] font-semibold transition-colors"
      style={{ color: active ? C.accent : C.textMuted, background: active ? C.accentSoft : "transparent" }}
    >
      <NavIcon name={icon} />
      {label}
    </Link>
  );
}

export default function AppNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed left-0 right-0 bottom-0 z-40 px-2.5 pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
    >
      <div
        className="pointer-events-auto max-w-[540px] mx-auto grid items-center h-[62px] rounded-[22px]"
        style={{
          gridTemplateColumns: "1fr 1fr 72px 1fr 1fr",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: `0 10px 30px -12px rgba(34,32,31,.35), 0 0 0 1px ${C.border}`,
        }}
      >
        {LEFT.map((t) => <Tab key={t.href} {...t} active={isActive(pathname, t.href)} />)}
        <div className="flex justify-center">
          <Link
            href="/viaggio"
            aria-label="Pianifica un nuovo viaggio"
            className="w-[58px] h-[58px] -mt-7 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(145deg, #8E3B55, #5E2436)",
              boxShadow: `0 0 0 5px ${C.bg}, 0 10px 20px -8px rgba(122,51,72,.7)`,
            }}
          >
            <EllyMark size={34} color="#FBFAF7" needle="#7A3348" />
          </Link>
        </div>
        {RIGHT.map((t) => <Tab key={t.href} {...t} active={isActive(pathname, t.href)} />)}
      </div>
    </nav>
  );
}
