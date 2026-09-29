import { NextRequest, NextResponse } from "next/server";
import { supabaseForRequest } from "@/lib/supabaseServer";
import { importOpenPlaces } from "@/lib/openData";
import { destinationKey, normName } from "@/lib/trialPlaces";

// Wikidata e OpenStreetMap possono impiegare qualche secondo: diamo tempo.
export const maxDuration = 60;

/**
 * Importa (o reimporta) una meta nell'archivio aperto della prova.
 * Solo per amministratori: il controllo lo fa il database (RLS) e lo
 * ripetiamo qui per dare un messaggio chiaro.
 */
export async function POST(request: NextRequest) {
  const { db, userId } = await supabaseForRequest(request);
  if (!userId) return NextResponse.json({ error: "Accesso richiesto" }, { status: 401 });
  const { data: profile } = await db.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "Solo per amministratori" }, { status: 403 });

  const { label } = (await request.json()) as { label?: string };
  if (!label?.trim()) return NextResponse.json({ error: "Manca la meta" }, { status: 400 });

  try {
    const { dest, places, errors } = await importOpenPlaces(label.trim());
    const key = destinationKey(label);
    const aliases = Array.from(new Set([normName(dest.label), destinationKey(dest.label)])).filter((a) => a && a !== key);

    const { error: dErr } = await db.from("trial_destinations").upsert({
      key,
      label: label.trim(),
      aliases,
      wikidata_id: dest.wikidataId,
      latitude: dest.latitude,
      longitude: dest.longitude,
      radius_km: dest.radiusKm,
      place_count: places.length,
      imported_at: new Date().toISOString(),
    });
    if (dErr) throw dErr;

    await db.from("trial_places").delete().eq("destination_key", key);
    if (places.length > 0) {
      const { error: pErr } = await db.from("trial_places").insert(places.map((p) => ({ ...p, destination_key: key })));
      if (pErr) throw pErr;
    }

    return NextResponse.json({
      key,
      places: places.length,
      withPhoto: places.filter((p) => p.image_url).length,
      restaurants: places.filter((p) => p.source === "osm").length,
      radiusKm: dest.radiusKm,
      errors,
    });
  } catch (err) {
    console.error("[Elly] Import archivio prova fallito:", err);
    const message = err instanceof Error ? err.message : (err as { message?: string })?.message ?? "Errore";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
