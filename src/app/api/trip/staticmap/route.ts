import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { GeneratedTrip } from "@/lib/tripGenerator";
import { logCostEvent } from "@/lib/costTracking";
import { GOOGLE_STATIC_MAP_USD_PER_CALL } from "@/lib/pricing";

/**
 * Genera l'immagine della "cartina degli spostamenti" per un viaggio,
 * usando Google Maps Static API. Come per le foto (/api/places/photo),
 * la chiave resta lato server: il browser chiede solo "la mappa del
 * viaggio X", non parla mai direttamente con Google.
 *
 * Ogni giorno ha un colore diverso, con i luoghi verificati numerati in
 * ordine cronologico e collegati da una linea — per mostrare a colpo
 * d'occhio come ci si è spostati nella destinazione.
 */

const DAY_COLORS = ["0x7A3348", "0x2563EB", "0x16A34A", "0xCA8A04", "0x9333EA", "0xDB2777", "0x0891B2"];

export async function GET(request: NextRequest) {
  const tripId = request.nextUrl.searchParams.get("tripId");
  if (!tripId) return new NextResponse(null, { status: 400 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return new NextResponse(null, { status: 404 });

  const { data, error } = await supabase.from("trips").select("itinerary").eq("id", tripId).single();
  if (error || !data) return new NextResponse(null, { status: 404 });

  const trip = { days: data.itinerary } as Pick<GeneratedTrip, "days">;

  const params: string[] = ["size=640x440", "scale=2", "maptype=roadmap"];
  let anyPoint = false;

  trip.days.forEach((day, dayIdx) => {
    const points = day.activities.filter((a) => a.verified && a.latitude !== null && a.longitude !== null);
    if (points.length === 0) return;
    anyPoint = true;
    const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
    const coords = points.map((p) => `${p.latitude},${p.longitude}`);

    if (coords.length > 1) {
      params.push(`path=color:${color}cc|weight:3|${coords.join("|")}`);
    }
    points.forEach((p, i) => {
      const label = i === 0 ? String(dayIdx + 1) : "";
      params.push(`markers=color:${color}|label:${label}|${p.latitude},${p.longitude}`);
    });
  });

  if (!anyPoint) return new NextResponse(null, { status: 404 });

  try {
    const url = `https://maps.googleapis.com/maps/api/staticmap?${params.join("&")}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return new NextResponse(null, { status: 502 });

    // Come per le foto: costo reale, registrato quando la chiamata a Google
    // avviene davvero (la risposta resta poi in cache un'ora, vedi sotto).
    void logCostEvent({
      tripId,
      costCenter: "google_places",
      description: "Cartina spostamenti (Static Maps)",
      quantity: 1,
      unit: "api_call",
      amountUsd: GOOGLE_STATIC_MAP_USD_PER_CALL,
    });

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[Elly] Errore nel proxy cartina Google Static Maps:", err);
    return new NextResponse(null, { status: 502 });
  }
}
