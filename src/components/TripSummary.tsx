"use client";

import { useState } from "react";
import Link from "next/link";
import { TRAVEL_THEMES, ELLY_COLORS } from "@/lib/travelData";
import { useBillingStatus } from "@/lib/useBillingStatus";
import type { GenerationChoice, LoggedBilling } from "@/lib/billingConfig";

type Props = {
  destination: string;
  people: number;
  startDate: string | null;
  endDate: string | null;
  themes: string[];
  budgetPerPerson: number;
  startTime: string;
  dinnerTime: string;
  onStartTimeChange: (t: string) => void;
  onDinnerTimeChange: (t: string) => void;
  onEdit: () => void;
  onGenerate: (mode: GenerationChoice) => void;
};

const C = ELLY_COLORS;
const MONTHS_SHORT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/**
 * Da dove arriverebbe il viaggio completo (stesso ordine del server: abbonamento → viaggio
 * gratuito → crediti). null = niente disponibile, quindi si genera la versione base.
 */
function fullSource(s: LoggedBilling): string | null {
  const sub = s.subscription;
  if (sub?.active && sub.used_month < s.limits.monthly && sub.used_day < s.limits.daily) {
    const left = s.limits.monthly - sub.used_month;
    return `Incluso nell'abbonamento · ${left === 1 ? "te ne resta 1" : `te ne restano ${left}`} questo mese`;
  }
  if (s.free_left > 0) return "Usa il tuo viaggio gratuito";
  if (s.credits > 0) return `Usa 1 viaggio acquistato · ${s.credits === 1 ? "ne hai 1" : `ne hai ${s.credits}`}`;
  return null;
}

function nightsBetween(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export default function TripSummary({
  destination, people, startDate, endDate, themes, budgetPerPerson,
  startTime, dinnerTime, onStartTimeChange, onDinnerTimeChange, onEdit, onGenerate,
}: Props) {
  const { status } = useBillingStatus();
  const billing = status?.enabled && status.loggedIn ? status : null;
  const source = billing ? fullSource(billing) : null;
  const [pick, setPick] = useState<"full" | "base">("full");
  const mode: GenerationChoice = source && pick === "base" ? "base" : "auto";

  const dateLabel = startDate && endDate ? `${formatDate(startDate)} → ${formatDate(endDate)}` : "—";
  const nights = startDate && endDate ? nightsBetween(startDate, endDate) : null;

  const rows = [
    { label: "Destinazione", value: destination || "—" },
    { label: "Persone", value: String(people) },
    { label: "Date", value: `${dateLabel}${nights ? ` · ${nights} notti` : ""}` },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.paper, color: C.text }}>
      <div className="flex-1 px-6 pt-16 pb-40">
        <button onClick={onEdit} className="text-sm mb-6 block" style={{ color: C.textMuted }}>
          ← indietro
        </button>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Riepilogo
        </p>
        <h2 className="text-[28px] font-semibold leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>Il tuo viaggio</h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: C.textMuted }}>
          Controlla i dettagli prima di generare l&apos;itinerario.
        </p>

        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-start gap-3.5 p-4"
              style={{ borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}
            >
              <div>
                <div className="text-[11px] uppercase tracking-[.3px] mb-0.5" style={{ color: C.textMuted }}>{row.label}</div>
                <div className="text-[14.5px] font-bold">{row.value}</div>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3.5 p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div className="text-[11px] uppercase tracking-[.3px] mb-0.5" style={{ color: C.textMuted }}>Mood</div>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {themes.map((id) => {
                  const t = TRAVEL_THEMES.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <span
                      key={id}
                      className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ border: `1.3px solid ${C.accent}`, color: C.accent }}
                    >
                      {t.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div className="text-[11px] uppercase tracking-[.3px] mb-0.5" style={{ color: C.textMuted }}>Budget a persona</div>
              <div className="text-[14.5px] font-bold">
                €{budgetPerPerson.toLocaleString("it-IT")} · totale gruppo €{(budgetPerPerson * people).toLocaleString("it-IT")}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4">
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[.3px] mb-1.5" style={{ color: C.textMuted }}>
                Orari indicativi (media per tutto il viaggio)
              </div>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2">
                  <span className="text-[12.5px]" style={{ color: C.textMuted }}>Inizio giornata</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    className="text-[14px] font-bold px-2 py-1 rounded-lg outline-none"
                    style={{ background: C.bg, border: `1.3px solid ${C.border}`, color: C.text }}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-[12.5px]" style={{ color: C.textMuted }}>Cena</span>
                  <input
                    type="time"
                    value={dinnerTime}
                    onChange={(e) => onDinnerTimeChange(e.target.value)}
                    className="text-[14px] font-bold px-2 py-1 rounded-lg outline-none"
                    style={{ background: C.bg, border: `1.3px solid ${C.border}`, color: C.text }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {billing && source && (
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[.3px] mb-2" style={{ color: C.textMuted }}>Che viaggio vuoi generare?</p>
            <div className="grid gap-2.5" role="radiogroup" aria-label="Tipo di viaggio">
              {([
                ["full", "Viaggio completo", `Luoghi verificati su Google Maps, foto e modifiche incluse. ${source}.`],
                ["base", "Versione base · gratis", "Luoghi dal nostro archivio aperto, non verificati. Non usa i tuoi viaggi disponibili."],
              ] as const).map(([key, title, text]) => {
                const on = pick === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setPick(key)}
                    className="text-left rounded-2xl p-4 flex gap-3 items-start"
                    style={{ background: on ? C.accentSoft : C.bgElev, border: `1.5px solid ${on ? C.accent : C.border}` }}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center"
                      style={{ border: `1.8px solid ${on ? C.accent : C.border}` }}
                    >
                      {on && <span className="w-[9px] h-[9px] rounded-full" style={{ background: C.accent }} />}
                    </span>
                    <span>
                      <span className="block text-[14.5px] font-bold">{title}</span>
                      <span className="block text-[12.5px] leading-snug mt-0.5" style={{ color: C.textMuted }}>{text}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {billing && !source && (
          <p className="mt-6 rounded-xl px-4 py-3 text-[13px] leading-relaxed" style={{ background: C.accentSoft }}>
            Verrà generata la <strong>versione base</strong> (luoghi non verificati), perché non hai viaggi completi disponibili.{" "}
            <Link href="/prezzi" className="font-bold underline" style={{ color: C.accent }}>Vedi i prezzi</Link>
          </p>
        )}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 px-6 pt-4 z-50"
        style={{
          background: `linear-gradient(to top, ${C.bg} 65%, transparent)`,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.75rem)",
        }}
      >
        <button
          onClick={() => onGenerate(mode)}
          className="w-full max-w-[420px] mx-auto block py-4 rounded-xl font-bold text-[15px]"
          style={{ background: C.accent, color: "#fff" }}
        >
          {source ? (pick === "base" ? "Genera la versione base" : "Genera il viaggio completo") : "Genera il viaggio"}
        </button>
      </div>
    </div>
  );
}
