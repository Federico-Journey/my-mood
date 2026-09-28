import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { refineTrip, type GenerateTripInput, type GeneratedTrip } from "@/lib/tripGenerator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tripId,
      currentTrip,
      feedback,
      destination, people, startDate, endDate, themes, budgetPerPerson,
    } = body as {
      tripId?: string | null;
      currentTrip: GeneratedTrip;
      feedback: string;
    } & GenerateTripInput;

    if (!currentTrip || !feedback || !feedback.trim()) {
      return NextResponse.json({ error: "Manca l'itinerario attuale o il feedback." }, { status: 400 });
    }

    const input: GenerateTripInput = {
      destination, people, startDate: startDate ?? null, endDate: endDate ?? null,
      themes, budgetPerPerson: budgetPerPerson ?? 0,
    };

    const updatedTrip = await refineTrip(currentTrip, input, feedback.trim());

    if (tripId) {
      const { error } = await supabase
        .from("trips")
        .update({
          title: updatedTrip.title,
          subtitle: updatedTrip.subtitle,
          itinerary: updatedTrip.days,
          duration_days: updatedTrip.days.length,
        })
        .eq("id", tripId);
      if (error) {
        console.error("[Elly] Errore nell'aggiornare il viaggio su Supabase:", error);
      }
    }

    return NextResponse.json({ trip: updatedTrip });
  } catch (err) {
    console.error("[Elly] Errore nella modifica del viaggio:", err);
    const message = err instanceof Error ? err.message : "Errore interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
