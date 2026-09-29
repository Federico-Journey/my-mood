"use client";

import { useState } from "react";
import { ELLY_COLORS } from "@/lib/travelData";

type Props = {
  people: number;
  initialBudget?: number;
  onSelect: (budgetPerPerson: number) => void;
  onBack: () => void;
};

const C = ELLY_COLORS;

const MIN_BUDGET = 50;
const MAX_DIGITS = 6;
const SLIDER_MIN = 100;
const SLIDER_MAX = 3000;

// Fasce indicative: scorciatoie per chi non ha un numero in mente.
const CHIPS = [
  { label: "Economico", value: 250 },
  { label: "Medio", value: 700 },
  { label: "Confort", value: 1200 },
  { label: "Lusso", value: 2200 },
];

function tierFor(value: number) {
  if (value < 350) return "Economico";
  if (value < 900) return "Medio";
  if (value < 1700) return "Confort";
  return "Lusso";
}

type Mode = "person" | "group";

export default function TravelBudgetSelector({ people, initialBudget = 700, onSelect, onBack }: Props) {
  // "digits" e' quello che l'utente scrive (solo cifre): cosi' puo' anche
  // cancellare tutto e riscrivere senza che il campo salti.
  const [mode, setMode] = useState<Mode>("person");
  const [digits, setDigits] = useState(String(initialBudget));

  const typed = digits ? Number(digits) : 0;
  const perPerson = mode === "person" ? typed : Math.round(typed / Math.max(people, 1));
  const groupTotal = mode === "person" ? typed * people : typed;
  const valid = perPerson >= MIN_BUDGET;

  const setPerPerson = (value: number) =>
    setDigits(String(mode === "person" ? value : value * people));

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    // Convertiamo il numero gia' scritto, cosi' il budget resta lo stesso.
    setDigits(digits ? String(next === "group" ? typed * people : Math.round(typed / Math.max(people, 1))) : "");
    setMode(next);
  };

  const formatted = digits ? Number(digits).toLocaleString("it-IT") : "";
  const sliderValue = Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, perPerson || SLIDER_MIN));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.paper, color: C.text }}>
      <div className="flex-1 px-6 pt-16 pb-40">
        <button onClick={onBack} className="text-sm mb-6 block" style={{ color: C.textMuted }}>
          ← indietro
        </button>
        <p className="text-[12px] font-semibold uppercase tracking-[.5px] mb-2" style={{ color: C.accent }}>
          Passo 5 di 5
        </p>
        <h2 className="text-[28px] font-semibold leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>Quanto vuoi spendere?</h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: C.textMuted }}>
          Scrivi la cifra che hai in mente, per l&apos;intero viaggio e voli esclusi. Elly costruisce l&apos;itinerario su questo budget.
        </p>

        {/* A persona / totale gruppo */}
        {people > 1 && (
          <div
            className="grid grid-cols-2 rounded-xl p-1 mb-6"
            style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
            role="tablist"
          >
            {(
              [
                ["person", "A persona"],
                ["group", `Totale gruppo (${people})`],
              ] as [Mode, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={mode === id}
                onClick={() => switchMode(id)}
                className="py-2 rounded-lg text-[13px] font-semibold"
                style={{
                  background: mode === id ? C.accent : "transparent",
                  color: mode === id ? "#fff" : C.textMuted,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Importo scritto a mano */}
        <label
          className="flex items-center justify-center gap-1 rounded-2xl py-5 mb-2 cursor-text"
          style={{ background: C.bgElev, border: `1.3px solid ${valid || !digits ? C.accent : C.border}` }}
        >
          <span className="text-[34px] font-semibold" style={{ fontFamily: "var(--font-display)", color: C.textMuted }}>€</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-label={mode === "person" ? "Budget a persona in euro" : "Budget totale del gruppo in euro"}
            value={formatted}
            placeholder="0"
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, MAX_DIGITS))}
            className="bg-transparent outline-none text-[40px] font-semibold text-center"
            style={{ fontFamily: "var(--font-display)", width: `${Math.max(formatted.length, 1) + 1}ch`, minWidth: "2.5ch", color: C.text }}
          />
        </label>
        <p className="text-center text-[12px] mb-5" style={{ color: !valid && digits ? C.accent : C.textMuted }}>
          {!digits
            ? "Scrivi un importo"
            : !valid
              ? `Almeno €${MIN_BUDGET} a persona`
              : mode === "person"
                ? `a persona · totale gruppo €${groupTotal.toLocaleString("it-IT")}`
                : `€${perPerson.toLocaleString("it-IT")} a persona`}
        </p>

        {valid && (
          <div className="text-center mb-6">
            <span
              className="inline-block text-[12px] font-bold px-3.5 py-1 rounded-full"
              style={{ border: `1.3px solid ${C.accent}`, color: C.accent }}
            >
              Fascia {tierFor(perPerson).toLowerCase()}
            </span>
          </div>
        )}

        {/* Scorciatoie: cursore e fasce, per chi preferisce non scrivere */}
        <p className="text-[11px] font-semibold uppercase tracking-[.1em] mb-2.5" style={{ color: C.textMuted }}>
          Oppure scegli una fascia
        </p>
        <div className="flex gap-2 flex-wrap mb-5">
          {CHIPS.map((c) => {
            const active = valid && perPerson === c.value;
            return (
              <button
                key={c.label}
                onClick={() => setPerPerson(c.value)}
                className="text-[12px] font-semibold px-3.5 py-2 rounded-full"
                style={{
                  background: active ? C.accent : C.bgElev,
                  border: `1.3px solid ${active ? C.accent : C.border}`,
                  color: active ? "#fff" : C.text,
                }}
              >
                {c.label} · €{c.value.toLocaleString("it-IT")}
              </button>
            );
          })}
        </div>

        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={50}
          value={sliderValue}
          onChange={(e) => setPerPerson(Number(e.target.value))}
          aria-label="Budget a persona: cursore"
          className="w-full mb-1.5"
          style={{ height: 4, borderRadius: 999, background: C.border, accentColor: C.accent }}
        />
        <div className="flex justify-between text-[11px]" style={{ color: C.textMuted }}>
          <span>€{SLIDER_MIN} a persona</span><span>€{SLIDER_MAX.toLocaleString("it-IT")}+</span>
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
          onClick={() => valid && onSelect(perPerson)}
          disabled={!valid}
          className="w-full max-w-[420px] mx-auto block py-4 rounded-xl font-bold text-[15px]"
          style={{
            background: valid ? C.accent : C.disabledBg,
            color: valid ? "#fff" : C.disabledText,
            cursor: valid ? "pointer" : "not-allowed",
          }}
        >
          Continua
        </button>
      </div>
    </div>
  );
}
