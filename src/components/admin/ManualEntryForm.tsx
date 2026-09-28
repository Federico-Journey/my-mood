"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import { EUR_TO_USD_RATE } from "@/lib/pricing";
import type { CostCenter } from "@/lib/costTracking";

const C = ELLY_COLORS;

const COST_CENTER_OPTIONS: { value: CostCenter; label: string }[] = [
  { value: "vercel", label: "Vercel" },
  { value: "supabase", label: "Supabase" },
  { value: "claude", label: "Claude (manuale)" },
  { value: "google_places", label: "Google (manuale)" },
  { value: "altro", label: "Altro" },
];

const REVENUE_SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "trip_purchase", label: "Acquisto viaggio" },
  { value: "subscription", label: "Abbonamento" },
  { value: "altro", label: "Altro" },
];

type Kind = "cost" | "revenue";

/**
 * Modulo per registrare a mano i costi fissi (Vercel, Supabase, dominio...)
 * e i ricavi — finché non c'è un sistema di pagamento automatico collegato,
 * questo è l'unico modo per far entrare i ricavi nella dashboard.
 */
export default function ManualEntryForm({ onSaved }: { onSaved: () => void }) {
  const [kind, setKind] = useState<Kind>("cost");
  const [costCenter, setCostCenter] = useState<CostCenter>("vercel");
  const [revenueSource, setRevenueSource] = useState("trip_purchase");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Inserisci un importo valido.");
      return;
    }
    setSaving(true);
    setError(null);
    setDone(false);

    const amountUsd = currency === "EUR" ? parsed * EUR_TO_USD_RATE : parsed;
    const occurredAtIso = new Date(occurredAt).toISOString();

    const table = kind === "cost" ? "cost_events" : "revenue_events";
    const row =
      kind === "cost"
        ? {
            cost_center: costCenter,
            description: description || null,
            amount_usd: amountUsd,
            occurred_at: occurredAtIso,
          }
        : {
            source: revenueSource,
            description: description || null,
            amount_usd: amountUsd,
            occurred_at: occurredAtIso,
          };

    const { error: err } = await supabase.from(table).insert(row);
    setSaving(false);
    if (err) {
      setError("Errore nel salvataggio: " + err.message);
      return;
    }
    setDescription("");
    setAmount("");
    setDone(true);
    onSaved();
  };

  const inputStyle = {
    border: `1px solid ${C.border}`,
    background: C.bgElev,
    color: C.text,
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-4 space-y-3" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
      <div className="flex gap-2">
        {(["cost", "revenue"] as Kind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className="px-3 py-1.5 rounded-full text-sm"
            style={
              kind === k
                ? { background: C.accent, color: "#fff" }
                : { background: C.disabledBg, color: C.textMuted }
            }
          >
            {k === "cost" ? "Costo fisso" : "Ricavo"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {kind === "cost" ? (
          <select
            value={costCenter}
            onChange={(e) => setCostCenter(e.target.value as CostCenter)}
            className="rounded-lg px-3 py-2 text-sm col-span-2"
            style={inputStyle}
          >
            {COST_CENTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <select
            value={revenueSource}
            onChange={(e) => setRevenueSource(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm col-span-2"
            style={inputStyle}
          >
            {REVENUE_SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="Descrizione (es. Canone Vercel settembre)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm col-span-2"
          style={inputStyle}
        />

        <input
          type="text"
          inputMode="decimal"
          placeholder="Importo"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm"
          style={inputStyle}
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as "EUR" | "USD")}
          className="rounded-lg px-3 py-2 text-sm"
          style={inputStyle}
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
        </select>

        <input
          type="date"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm col-span-2"
          style={inputStyle}
        />
      </div>

      {error && <p className="text-sm" style={{ color: "#d03b3b" }}>{error}</p>}
      {done && !error && <p className="text-sm" style={{ color: "#0ca30c" }}>Salvato.</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg py-2 text-sm font-medium disabled:opacity-50"
        style={{ background: C.accent, color: "#fff" }}
      >
        {saving ? "Salvo..." : "Aggiungi"}
      </button>
    </form>
  );
}
