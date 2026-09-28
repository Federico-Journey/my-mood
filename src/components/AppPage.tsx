"use client";

/**
 * Guscio comune delle pagine principali (Home, Bacheca, Viaggi, Profilo,
 * Impostazioni, Notifiche): sfondo "carta", intestazione in alto e barra
 * di navigazione in basso, contenuto centrato su una colonna da telefono.
 */

import type { ReactNode } from "react";
import { ELLY_COLORS } from "@/lib/travelData";
import AppHeader from "@/components/AppHeader";
import AppNav from "@/components/AppNav";

const C = ELLY_COLORS;

export default function AppPage({ children, notificationCount }: { children: ReactNode; notificationCount?: number }) {
  return (
    <div className="min-h-screen" style={{ background: C.paper, color: C.text }}>
      <div className="max-w-[560px] mx-auto px-5 pb-32">
        <AppHeader notificationCount={notificationCount} />
        {children}
      </div>
      <AppNav />
    </div>
  );
}
