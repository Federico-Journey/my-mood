"use client";

import { ELLY_COLORS } from "@/lib/travelData";
import AppPage from "@/components/AppPage";

const C = ELLY_COLORS;

export default function BachecaPage() {
  return (
    <AppPage>
      <div className="pt-5 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[.1em]" style={{ color: C.textMuted }}>Idee e racconti di viaggio</p>
        <h1 className="text-[26px] font-medium mt-1">Bacheca</h1>
      </div>
      <div className="rounded-2xl p-6" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
        <p className="text-[15px] font-semibold mb-1.5">I primi articoli arrivano presto</p>
        <p className="text-[13.5px] leading-relaxed" style={{ color: C.textMuted }}>
          Qui pubblicheremo guide a destinazioni nel mondo e idee di viaggio da fare con il gruppo. Alcuni articoli saranno riservati agli abbonati premium.
        </p>
      </div>
    </AppPage>
  );
}
