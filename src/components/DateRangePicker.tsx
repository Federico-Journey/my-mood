"use client";

import { useState, type CSSProperties } from "react";
import { ELLY_COLORS } from "@/lib/travelData";

type Props = {
  onSelect: (startDate: string, endDate: string) => void;
  onBack: () => void;
};

const C = ELLY_COLORS;

const MONTHS = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const MONTHS_SHORT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
const WEEKDAYS = ["L","M","M","G","V","S","D"];

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function sameDay(a: Date | null, b: Date | null) { return !!a && !!b && a.toDateString() === b.toDateString(); }
function toISO(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Cell = { key: string; day: number | null; onClick?: () => void; style: CSSProperties };

export default function DateRangePicker({ onSelect, onBack }: Props) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = startOfDay(new Date());

  const pickDate = (day: number) => {
    const clicked = startOfDay(new Date(y, m, day));
    if (!start || (start && end)) { setStart(clicked); setEnd(null); }
    else if (clicked < start) { setStart(clicked); setEnd(null); }
    else { setEnd(clicked); }
  };

  const nights = start && end ? Math.round((end.getTime() - start.getTime()) / 86400000) : null;
  const canContinue = !!start && !!end;

  const cells: Cell[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ key: `e${i}`, day: null, style: { visibility: "hidden" } });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d);
    const isPast = date < today;
    const isStart = sameDay(date, start);
    const isEnd = sameDay(date, end);
    const isSingle = isStart && isEnd;
    const inRange = !!start && !!end && date > start && date < end;

    let bg = "transparent";
    let color: string = C.text;
    let radius = "8px";
    if (isSingle) { bg = C.accent; color = "#fff"; }
    else if (isStart) { bg = C.accent; color = "#fff"; radius = end ? "8px 0 0 8px" : "8px"; }
    else if (isEnd) { bg = C.accent; color = "#fff"; radius = "0 8px 8px 0"; }
    else if (inRange) { bg = C.accentSoft; radius = "0"; }
    if (isPast) color = C.border;

    cells.push({
      key: `d${d}`,
      day: d,
      onClick: isPast ? undefined : () => pickDate(d),
      style: {
        background: bg,
        color,
        borderRadius: radius,
        border: sameDay(date, today) && !isStart && !isEnd ? `1.3px solid ${C.textMuted}` : "none",
        cursor: isPast ? "not-allowed" : "pointer",
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.paper, color: C.text }}>
      <div className="flex-1 px-6 pt-16 pb-40">
        <button onClick={onBack} className="text-sm mb-6 block" style={{ color: C.textMuted }}>
          ← indietro
        </button>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Passo 3 di 5
        </p>
        <h2 className="text-[28px] font-semibold leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>Da quando a quando?</h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: C.textMuted }}>
          Seleziona la data di partenza e quella di ritorno.
        </p>

        <div className="max-w-[300px] mx-auto">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCursor(new Date(y, m - 1, 1))}
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center"
            style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
          >
            ‹
          </button>
          <div className="text-[13px] font-bold capitalize">{MONTHS[m]} {y}</div>
          <button
            onClick={() => setCursor(new Date(y, m + 1, 1))}
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center"
            style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-[2px] mb-1">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="text-center text-[10px] font-semibold pb-1" style={{ color: C.textMuted }}>{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[2px]">
          {cells.map((c) => (
            <div
              key={c.key}
              onClick={c.onClick}
              className="h-9 flex items-center justify-center text-[12px] font-semibold"
              style={c.style}
            >
              {c.day ?? ""}
            </div>
          ))}
        </div>
        </div>

        <div
          className="mt-6 rounded-xl p-4 text-center"
          style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
        >
          {!start && <div className="text-[13px]" style={{ color: C.textMuted }}>Seleziona la data di partenza</div>}
          {start && !end && (
            <div className="text-[15px] font-bold">
              Dal {start.getDate()} {MONTHS_SHORT[start.getMonth()]} — ora scegli il ritorno
            </div>
          )}
          {start && end && (
            <>
              <div className="text-[15px] font-bold">
                {start.getDate()} {MONTHS_SHORT[start.getMonth()]} → {end.getDate()} {MONTHS_SHORT[end.getMonth()]} {end.getFullYear()}
              </div>
              <div className="text-[12px] font-semibold mt-1" style={{ color: C.accent }}>
                {nights} nott{nights === 1 ? "e" : "i"}
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 px-6 pt-4 z-50"
        style={{
          background: `linear-gradient(to top, ${C.bg} 65%, transparent)`,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.75rem)",
        }}
      >
        <button
          onClick={() => start && end && onSelect(toISO(start), toISO(end))}
          disabled={!canContinue}
          className="w-full max-w-[420px] mx-auto block py-4 rounded-xl font-bold text-[15px]"
          style={{
            background: canContinue ? C.accent : C.disabledBg,
            color: canContinue ? "#fff" : C.disabledText,
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          Continua
        </button>
      </div>
    </div>
  );
}
