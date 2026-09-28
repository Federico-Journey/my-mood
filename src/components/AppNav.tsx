"use client";

/**
 * Barra di navigazione in basso: solo parole (niente icone) e, al centro,
 * il pulsante con il logo che avvia la generazione di un nuovo viaggio.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ELLY_COLORS } from "@/lib/travelData";
import { EllyMark } from "@/components/EllyLogo";

const C = ELLY_COLORS;

const LEFT = [
  { href: "/", label: "Home" },
  { href: "/bacheca", label: "Bacheca" },
];
const RIGHT = [
  { href: "/viaggi", label: "Viaggi" },
  { href: "/profilo", label: "Profilo" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="relative flex items-center justify-center h-full text-[12px] font-semibold"
      style={{ color: active ? C.accent : C.textMuted }}
    >
      {label}
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 bottom-2.5 w-1 h-1 rounded-full"
          style={{ background: C.accent }}
        />
      )}
    </Link>
  );
}

export default function AppNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: `1px solid ${C.border}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="max-w-[560px] mx-auto grid h-16" style={{ gridTemplateColumns: "1fr 1fr 76px 1fr 1fr" }}>
        {LEFT.map((t) => <Tab key={t.href} {...t} active={isActive(pathname, t.href)} />)}
        <div className="flex justify-center">
          <Link
            href="/viaggio"
            aria-label="Pianifica un nuovo viaggio"
            className="w-[60px] h-[60px] -mt-6 rounded-full flex items-center justify-center"
            style={{ background: C.accent, boxShadow: `0 0 0 5px ${C.bg}, 0 8px 18px -8px rgba(122,51,72,.6)` }}
          >
            <EllyMark size={30} color="#FFFFFF" needle={C.accent} />
          </Link>
        </div>
        {RIGHT.map((t) => <Tab key={t.href} {...t} active={isActive(pathname, t.href)} />)}
      </div>
    </nav>
  );
}
