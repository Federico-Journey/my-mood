"use client";

import { ELLY_COLORS } from "@/lib/travelData";

const C = ELLY_COLORS;

/**
 * Un piccolo "tassello" con un numero grande — per i totali in cima alla
 * dashboard (costi totali, ricavi totali, margine, ecc.).
 */
export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "bad";
}) {
  const valueColor = tone === "good" ? "#0ca30c" : tone === "bad" ? "#d03b3b" : C.text;
  return (
    <div
      className="flex-1 min-w-[160px] rounded-2xl p-4"
      style={{ background: C.bgElev, border: `1px solid ${C.border}` }}
    >
      <div className="text-xs" style={{ color: C.textMuted }}>{label}</div>
      <div className="text-2xl font-semibold mt-1" style={{ color: valueColor }}>{value}</div>
    </div>
  );
}

export type BarChartItem = { label: string; value: number; color: string };

/**
 * Grafico a barre orizzontali semplice, disegnato in SVG puro (niente
 * librerie esterne — con poche categorie non serve). Ogni barra è
 * etichettata direttamente col suo valore, quindi non serve una legenda
 * separata.
 */
export function CategoryBarChart({
  items,
  formatValue,
}: {
  items: BarChartItem[];
  formatValue: (v: number) => string;
}) {
  const max = Math.max(1e-9, ...items.map((i) => i.value));
  const sorted = [...items].sort((a, b) => b.value - a.value);

  if (items.every((i) => i.value === 0)) {
    return <p className="text-sm" style={{ color: C.textMuted }}>Nessun dato ancora.</p>;
  }

  return (
    <div className="space-y-3">
      {sorted.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: C.text }}>{item.label}</span>
            <span style={{ color: C.textMuted }} className="tabular-nums">{formatValue(item.value)}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: C.disabledBg }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(2, (item.value / max) * 100)}%`,
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export type TrendPoint = { label: string; cost: number; revenue: number };

/**
 * Andamento nel tempo (costi vs ricavi) come mini grafico a barre
 * affiancate — niente assi complicati, giusto per vedere il trend a colpo
 * d'occhio giorno per giorno.
 */
export function TrendChart({ points }: { points: TrendPoint[] }) {
  const max = Math.max(1e-9, ...points.map((p) => Math.max(p.cost, p.revenue)));
  if (points.length === 0) {
    return <p className="text-sm" style={{ color: C.textMuted }}>Nessun dato ancora.</p>;
  }
  return (
    <div>
      <div className="flex items-end gap-1.5 h-32">
        {points.map((p) => (
          <div key={p.label} className="flex-1 flex items-end gap-0.5 group relative" title={`${p.label} — costi: $${p.cost.toFixed(2)}, ricavi: $${p.revenue.toFixed(2)}`}>
            <div
              className="flex-1 rounded-t"
              style={{ height: `${Math.max(2, (p.cost / max) * 100)}%`, background: "#eb6834" }}
            />
            <div
              className="flex-1 rounded-t"
              style={{ height: `${Math.max(2, (p.revenue / max) * 100)}%`, background: "#1baf7a" }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] mt-1" style={{ color: C.textMuted }}>
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
      <div className="flex gap-4 mt-3 text-xs" style={{ color: C.textMuted }}>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#eb6834" }} />Costi</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#1baf7a" }} />Ricavi</span>
      </div>
    </div>
  );
}
