"use client";

import { ELLY_COLORS } from "@/lib/travelData";
import { CompassIcon } from "@/components/EllyIcons";

const C = ELLY_COLORS;

type Props = {
  error?: string | null;
  onRetry?: () => void;
  onBack?: () => void;
};

export default function GeneratingScreen({ error, onRetry, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: C.paper, color: C.text }}>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ border: `1.3px solid ${C.border}`, background: C.bgElev, color: C.accent }}
      >
        <CompassIcon size={28} className={error ? "" : "animate-spin"} />
      </div>

      {!error ? (
        <>
          <h2 className="text-[20px] font-bold mb-2">Sto costruendo il tuo itinerario</h2>
          <p className="text-sm max-w-[280px]" style={{ color: C.textMuted }}>
            Sto scegliendo i luoghi e verificandoli, ci vuole qualche secondo…
          </p>
        </>
      ) : (
        <>
          <h2 className="text-[20px] font-bold mb-2">Qualcosa non ha funzionato</h2>
          <p className="text-sm max-w-[300px] mb-6" style={{ color: C.textMuted }}>{error}</p>
          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-5 py-3 rounded-xl font-bold text-sm"
                style={{ background: C.accent, color: "#fff" }}
              >
                Riprova
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="px-5 py-3 rounded-xl font-bold text-sm"
                style={{ background: C.bgElev, border: `1.3px solid ${C.border}`, color: C.text }}
              >
                Torna indietro
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
