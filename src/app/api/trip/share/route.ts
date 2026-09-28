import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { GeneratedTrip } from "@/lib/tripGenerator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, trip, themeAccent } = body as {
      tripId?: string | null;
      trip: GeneratedTrip;
      themeAccent?: string;
    };

    if (!trip || !Array.isArray(trip.days) || trip.days.length === 0) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    // Un solo link di condivisione per viaggio: se esiste già, lo riusiamo
    // (aggiornando l'itinerario, nel caso sia stato modificato via chat da
    // quando è stato condiviso) invece di crearne uno nuovo ogni volta —
    // così i voti del gruppo restano tutti sullo stesso link, e "I miei
    // viaggi" può mostrarli senza doverli cercare in più posti.
    if (tripId) {
      const { data: existing } = await supabase
        .from("shared_trips")
        .select("id")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from("shared_trips")
          .update({ trip_data: trip, theme_accent: themeAccent ?? "#7A3348" })
          .eq("id", existing.id);
        if (updateError) {
          console.error("Supabase error (update):", updateError);
        }
        return NextResponse.json({ id: existing.id });
      }
    }

    const { data, error } = await supabase
      .from("shared_trips")
      .insert({
        trip_id: tripId ?? null,
        theme_accent: themeAccent ?? "#7A3348",
        trip_data: trip,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
