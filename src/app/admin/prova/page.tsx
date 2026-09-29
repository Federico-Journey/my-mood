"use client";

/**
 * /admin/prova — archivio aperto della versione di prova.
 * Per ogni meta importa da Wikidata/OpenStreetMap i luoghi (con foto
 * Wikimedia Commons) usati dalla generazione "di prova", che non chiama Google.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { authHeaders } from "@/lib/authHeaders";
import { ELLY_COLORS, DESTINATION_SUGGESTIONS } from "@/lib/travelData";
import { destinationKey } from "@/lib/trialPlaces";

const C = ELLY_COLORS;

// Mete iniziali: i suggerimenti dell'app più le più richieste dagli italiani.
const EXTRA = [
  "Milano, Italia", "Firenze, Italia", "Venezia, Italia", "Napoli, Italia", "Torino, Italia", "Bologna, Italia",
  "Palermo, Italia", "Verona, Italia", "Matera, Italia", "Lecce, Italia", "Costiera Amalfitana, Italia",
  "Cinque Terre, Italia", "Lago di Como, Italia", "Madrid, Spagna", "Siviglia, Spagna", "Valencia, Spagna",
  "Malaga, Spagna", "Monaco di Baviera, Germania", "Budapest, Ungheria", "Cracovia, Polonia", "Copenaghen, Danimarca",
  "Stoccolma, Svezia", "Edimburgo, Regno Unito", "Dublino, Irlanda", "Istanbul, Turchia", "La Valletta, Malta",
  "Nizza, Francia", "Bruxelles, Belgio", "Salisburgo, Austria", "Spalato, Croazia",
];
const PRESET = Array.from(new Set([...DESTINATION_SUGGESTIONS.map((d) => `${d.name}, ${d.country}`), ...EXTRA]));

type DestRow = { key: string; label: string; place_count: number; imported_at: string | null };
type RunState = { state: "idle" | "running" | "ok" | "error"; message?: string };

export default function AdminProvaPage() {
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");
  const [rows, setRows] = useState<Record<string, DestRow>>({});
  const [runs, setRuns] = useState<Record<string, RunState>>({});
  const [custom, setCustom] = useState("");
  const [bulk, setBulk] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("trial_destinations").select("key, label, place_count, imported_at");
    setRows(Object.fromEntries((data ?? []).map((r) => [r.key, r as DestRow])));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setStatus("denied"); return; }
      const { data: p } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).maybeSingle();
      if (!p?.is_admin) { setStatus("denied"); return; }
      await load();
      setStatus("ok");
    });
  }, [load]);

  const importOne = useCallback(async (label: string) => {
    setRuns((r) => ({ ...r, [label]: { state: "running" } }));
    try {
      const res = await fetch("/api/admin/trial-places", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ label }),
      });
      // Se il server va in timeout risponde con una pagina di errore, non con JSON: la mostriamo comunque.
      const raw = await res.text();
      let data: { error?: string; places?: number; withPhoto?: number; restaurants?: number; errors?: string[] } = {};
      try { data = JSON.parse(raw); } catch { /* risposta non JSON */ }
      if (!res.ok) throw new Error(data.error || `Errore ${res.status}: ${raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 200)}`);
      const warn = data.errors?.length ? ` · avvisi: ${data.errors.join("; ")}` : "";
      setRuns((r) => ({
        ...r,
        [label]: { state: "ok", message: `${data.places} luoghi (${data.withPhoto} con foto, ${data.restaurants} locali)${warn}` },
      }));
    } catch (err) {
      setRuns((r) => ({ ...r, [label]: { state: "error", message: err instanceof Error ? err.message : "Errore" } }));
    }
    await load();
  }, [load]);

  const importMissing = async () => {
    setBulk(true);
    for (const label of PRESET) {
      if (rows[destinationKey(label)]?.place_count) continue;
      await importOne(label);
      await new Promise((r) => setTimeout(r, 1500)); // gentilezza verso Wikidata/OSM
    }
    setBulk(false);
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: C.paper, color: C.textMuted }}>Caricamento…</div>;
  }
  if (status === "denied") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: C.paper, color: C.text }}>
        <p>Non hai accesso a questa pagina.</p>
        <Link href="/auth" className="underline" style={{ color: C.accent }}>Accedi</Link>
      </div>
    );
  }

  const labels = Array.from(new Set([...PRESET, ...Object.values(rows).map((r) => r.label)]));
  const done = labels.filter((l) => rows[destinationKey(l)]?.place_count).length;

  return (
    <div className="min-h-screen" style={{ background: C.paper, color: C.text }}>
      <div className="max-w-[760px] mx-auto px-5 py-8">
        <Link href="/impostazioni" className="text-[13px] font-semibold" style={{ color: C.textMuted }}>← Impostazioni</Link>
        <h1 className="text-[26px] font-medium mt-3 mb-1">Archivio della prova</h1>
        <p className="text-[13.5px] leading-relaxed mb-5" style={{ color: C.textMuted }}>
          Luoghi da Wikidata e OpenStreetMap, foto da Wikimedia Commons. Chi prova Elly senza accesso riceve itinerari
          costruiti solo con questi luoghi: nessuna chiamata a Google. {done} mete su {labels.length} importate.
        </p>

        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={importMissing}
            disabled={bulk}
            className="px-4 py-2.5 rounded-xl font-bold text-[13.5px]"
            style={{ background: C.accent, color: "#fff", opacity: bulk ? 0.6 : 1 }}
          >
            {bulk ? "Importo una meta alla volta…" : "Importa tutte le mancanti"}
          </button>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Altra meta, es. Porto, Portogallo"
            className="flex-1 min-w-[200px] rounded-xl px-3.5 py-2.5 text-[14px] outline-none"
            style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
          />
          <button
            onClick={() => custom.trim() && importOne(custom.trim())}
            className="px-4 py-2.5 rounded-xl font-bold text-[13.5px]"
            style={{ background: C.bgElev, border: `1.3px solid ${C.border}` }}
          >
            Importa
          </button>
        </div>

        <ul className="rounded-2xl overflow-hidden" style={{ background: C.bgElev, border: `1px solid ${C.border}` }}>
          {labels.map((label, i) => {
            const row = rows[destinationKey(label)];
            const run = runs[label];
            return (
              <li key={label} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate">{label}</div>
                  <div className="text-[12px] break-words whitespace-pre-wrap" style={{ color: run?.state === "error" ? C.accent : C.textMuted }}>
                    {run?.state === "running"
                      ? "Importo…"
                      : run?.message
                        ?? (row?.place_count
                          ? `${row.place_count} luoghi · ${row.imported_at ? new Date(row.imported_at).toLocaleDateString("it-IT") : ""}`
                          : "Non ancora importata")}
                  </div>
                </div>
                <button
                  onClick={() => importOne(label)}
                  disabled={run?.state === "running" || bulk}
                  className="text-[12.5px] font-bold px-3 py-1.5 rounded-lg shrink-0"
                  style={{ border: `1.3px solid ${C.border}`, color: C.accent }}
                >
                  {row?.place_count ? "Aggiorna" : "Importa"}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="text-[11.5px] mt-4" style={{ color: C.textMuted }}>
          Dati © OpenStreetMap contributors (ODbL) · Wikidata (CC0) · foto Wikimedia Commons con autore e licenza.
        </p>
      </div>
    </div>
  );
}
