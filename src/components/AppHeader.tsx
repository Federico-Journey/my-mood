"use client";

/**
 * Intestazione delle pagine principali: logo a sinistra, impostazioni
 * (ingranaggio) e notifiche (campanella) a destra.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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

/** Numero di notifiche non lette dell'utente loggato (0 se ospite). */
function useUnreadCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { if (!cancelled) setCount(0); return; }
      const { count: n } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      if (!cancelled) setCount(n ?? 0);
    };
    load();
    // Nessun "push" in tempo reale per ora: ricontrolliamo ogni minuto e ogni
    // volta che l'app torna in primo piano.
    const timer = setInterval(load, 60_000);
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("elly:notifications-changed", load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("elly:notifications-changed", load);
    };
  }, []);
  return count;
}

export default function AppHeader({ notificationCount }: { notificationCount?: number }) {
  const unread = useUnreadCount();
  const badge = notificationCount ?? unread;
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
        <RoundLink href="/notifiche" label="Notifiche" badge={badge}>
          <BellIcon size={17} />
        </RoundLink>
      </div>
    </header>
  );
}
