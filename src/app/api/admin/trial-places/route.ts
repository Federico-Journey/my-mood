import { NextRequest, NextResponse } from "next/server";
import { supabaseForRequest } from "@/lib/supabaseServer";
import { importPart } from "@/lib/openData";
import { destinationKey, normName } from "@/lib/trialPlaces";

// Wikidata e OpenStreetMap possono impiegare qualche secondo: diamo tempo.
export const maxDuration = 60;

/**
 * Importa (o reimporta) UNA fonte di una meta nell'archivio aperto della prova:
 * part = "wikidata" (monumenti, musei, natura + foto) oppure "osm" (ristoranti e bar).
 * Due chiamate separate, così ciascuna resta entro il tempo massimo del server.
 * Solo per amministratori: il controllo lo fa il database (RLS) e lo ripetiamo qui.
 */
export async function POST(request: NextRequest) {
  const { db, userId } = await supabaseForRequest(request);
  if (!userId) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const { data: profile } = await db.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "Solo per amministratori" }, { status: 403 });

  const { label, part } = (await request.json()) as { label?: string; part?: string };
  if (!label?.trim()) return NextResponse.json({ error: "Manca la meta" }, { status: 400 });
  if (part !== "wikidata" && part !== "osm") return NextResponse.json({ error: "Fonte non valida" }, { status: 400 });

  try {
    const { dest, places, error } = await importPart(label.trim(), part);
    const key = destinationKey(label);
    const aliases = Array.from(new Set([normName(dest.label), destinationKey(dest.label)])).filter((a) => a && a !== key);

    // Anagrafica della meta (senza toccare il conteggio, che ricalcoliamo alla fine).
    const { error: dErr } = await db.from("trial_destinations").upsert({
      key,
      label: label.trim(),
      aliases,
      wikidata_id: dest.wikidataId,
      latitude: dest.latitude,
      longitude: dest.longitude,
      radius_km: dest.radiusKm,
    });
    if (dErr) throw dErr;

    // Se la fonte non ha risposto teniamo i luoghi già importati; altrimenti li sostituiamo.
    if (!error) {
      await db.from("trial_places").delete().eq("destination_key", key).eq("source", part);
      if (places.length > 0) {
        const { error: pErr } = await db.from("trial_places").insert(places.map((p) => ({ ...p, destination_key: key })));
        if (pErr) throw pErr;
      }
    }

    const { count } = await db.from("trial_places").select("id", { count: "exact", head: true }).eq("destination_key", key);
    await db.from("trial_destinations").update({ place_count: count ?? 0, imported_at: new Date().toISOString() }).eq("key", key);

    return NextResponse.json({
      key,
      part,
      places: places.length,
      withPhoto: places.filter((p) => p.image_url).length,
      total: count ?? 0,
      radiusKm: dest.radiusKm,
      error,
    });
  } catch (err) {
    console.error("[Elly] Import archivio prova fallito:", err);
    const message = err instanceof Error ? err.message : (err as { message?: string })?.message ?? "Errore";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
