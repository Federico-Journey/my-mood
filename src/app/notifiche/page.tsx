"use client";

import { ELLY_COLORS } from "@/lib/travelData";
import AppPage from "@/components/AppPage";
import { BellIcon } from "@/components/EllyIcons";

const C = ELLY_COLORS;

export default function NotifichePage() {
  return (
    <AppPage>
      <h1 className="text-[26px] font-medium pt-5 mb-5">Notifiche</h1>
      <div className="rounded-2xl p-6 text-center" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
        <div className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: C.accentSoft, color: C.accent }}>
          <BellIcon size={20} />
        </div>
        <p className="text-[15px] font-semibold mb-1.5">Nessuna notifica</p>
        <p className="text-[13.5px] leading-relaxed" style={{ color: C.textMuted }}>
          Presto qui troverai i voti del gruppo sui tuoi viaggi, i nuovi articoli in Bacheca e i promemoria prima della partenza.
        </p>
      </div>
    </AppPage>
  );
}
