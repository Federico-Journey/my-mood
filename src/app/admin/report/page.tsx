"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ELLY_COLORS } from "@/lib/travelData";
import { StatTile, CategoryBarChart, TrendChart, type BarChartItem, type TrendPoint } from "@/components/admin/AdminCharts";
import ManualEntryForm from "@/components/admin/ManualEntryForm";

const C = ELLY_COLORS;

type CostRow = { cost_center: string; amount_usd: number; occurred_at: string; trip_id: string | null };
type RevenueRow = { source: string; amount_usd: number; occurred_at: string };

const COST_CENTER_LABEL: Record<string, string> = {
  claude: "Claude",
  google_places: "Google",
  vercel: "Vercel",
  supabase: "Supabase",
  altro: "Altro",
};
const COST_CENTER_COLOR: Record<string, string> = {
  claude: "#2a78d6",
  google_places: "#eb6834",
  vercel: "#1baf7a",
  supabase: "#eda100",
  altro: "#e87ba4",
};

const REVENUE_SOURCE_LABEL: Record<string, string> = {
  trip_purchase: "Acquisto viaggio",
  subscription: "Abbonamento",
  altro: "Altro",
};
const REVENUE_SOURCE_COLOR: Record<string, string> = {
  trip_purchase: "#2a78d6",
  subscription: "#eb6834",
  altro: "#e87ba4",
};

const fmtUsd = (v: number) => `$${v.toFixed(2)}`;

function dayLabel(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AdminReportPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");
  const [costs, setCosts] = useState<CostRow[]>([]);
  const [revenues, setRevenues] = useState<RevenueRow[]>([]);

  const loadData = useCallback(async () => {
    const [{ data: costData }, { data: revenueData }] = await Promise.all([
      supabase
        .from("cost_events")
        .select("cost_center, amount_usd, occurred_at, trip_id")
        .order("occurred_at", { ascending: true })
        .limit(10000),
      supabase
        .from("revenue_events")
        .select("source, amount_usd, occurred_at")
        .order("occurred_at", { ascending: true })
        .limit(10000),
    ]);
    setCosts(costData ?? []);
    setRevenues(revenueData ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setStatus("denied");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!profile?.is_admin) {
        setStatus("denied");
        return;
      }
      await loadData();
      setStatus("ok");
    });
  }, [loadData]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg, color: C.textMuted }}>Caricamento…</div>;
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: C.bg, color: C.text }}>
        <p>Non hai accesso a questa pagina.</p>
        <Link href="/auth" className="underline" style={{ color: C.accent }}>Accedi</Link>
      </div>
    );
  }

  // --- Aggregazioni ---------------------------------------------------
  const totalCostUsd = costs.reduce((s, c) => s + Number(c.amount_usd), 0);
  const totalRevenueUsd = revenues.reduce((s, r) => s + Number(r.amount_usd), 0);
  const netUsd = totalRevenueUsd - totalCostUsd;

  const costByCenter = new Map<string, number>();
  for (const c of costs) costByCenter.set(c.cost_center, (costByCenter.get(c.cost_center) ?? 0) + Number(c.amount_usd));
  const costItems: BarChartItem[] = Array.from(costByCenter.entries()).map(([center, value]) => ({
    label: COST_CENTER_LABEL[center] ?? center,
    value,
    color: COST_CENTER_COLOR[center] ?? "#898781",
  }));

  const revenueBySource = new Map<string, number>();
  for (const r of revenues) revenueBySource.set(r.source, (revenueBySource.get(r.source) ?? 0) + Number(r.amount_usd));
  const revenueItems: BarChartItem[] = Array.from(revenueBySource.entries()).map(([source, value]) => ({
    label: REVENUE_SOURCE_LABEL[source] ?? source,
    value,
    color: REVENUE_SOURCE_COLOR[source] ?? "#898781",
  }));

  const tripCostTotal = costs.filter((c) => c.trip_id).reduce((s, c) => s + Number(c.amount_usd), 0);
  const tripCount = new Set(costs.filter((c) => c.trip_id).map((c) => c.trip_id)).size;
  const avgCostPerTrip = tripCount > 0 ? tripCostTotal / tripCount : 0;

  // Trend ultimi 30 giorni
  const trendMap = new Map<string, { cost: number; revenue: number }>();
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    trendMap.set(d.toISOString().slice(0, 10), { cost: 0, revenue: 0 });
  }
  for (const c of costs) {
    const key = c.occurred_at.slice(0, 10);
    const entry = trendMap.get(key);
    if (entry) entry.cost += Number(c.amount_usd);
  }
  for (const r of revenues) {
    const key = r.occurred_at.slice(0, 10);
    const entry = trendMap.get(key);
    if (entry) entry.revenue += Number(r.amount_usd);
  }
  const trendPoints: TrendPoint[] = Array.from(trendMap.entries()).map(([iso, v]) => ({
    label: dayLabel(iso),
    cost: v.cost,
    revenue: v.revenue,
  }));

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: C.bg }}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: C.text }}>Costi &amp; ricavi</h1>
          <p className="text-sm" style={{ color: C.textMuted }}>
            Solo tu puoi vedere questa pagina. I costi Claude e Google Text Search si registrano da soli a ogni generazione; Vercel, Supabase e i ricavi vanno aggiunti qui sotto a mano.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <StatTile label="Costi totali" value={fmtUsd(totalCostUsd)} />
          <StatTile label="Ricavi totali" value={fmtUsd(totalRevenueUsd)} />
          <StatTile label="Margine netto" value={fmtUsd(netUsd)} tone={netUsd >= 0 ? "good" : "bad"} />
          <StatTile label="Costo medio per viaggio" value={tripCount > 0 ? fmtUsd(avgCostPerTrip) : "—"} />
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          <h2 className="text-sm font-medium mb-3" style={{ color: C.text }}>Costi per centro di costo</h2>
          <CategoryBarChart items={costItems} formatValue={fmtUsd} />
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          <h2 className="text-sm font-medium mb-3" style={{ color: C.text }}>Ricavi per fonte</h2>
          <CategoryBarChart items={revenueItems} formatValue={fmtUsd} />
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          <h2 className="text-sm font-medium mb-3" style={{ color: C.text }}>Ultimi 30 giorni</h2>
          <TrendChart points={trendPoints} />
        </div>

        <div>
          <h2 className="text-sm font-medium mb-3" style={{ color: C.text }}>Aggiungi voce manuale</h2>
          <ManualEntryForm onSaved={loadData} />
        </div>
      </div>
    </div>
  );
}
