import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateTrip, type GenerateTripInput } from "@/lib/tripGenerator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, people, startDate, endDate, themes, budgetPerPerson, userId } = body as GenerateTripInput & { userId?: string | null };

    if (!destination || !people || !themes || !Array.isArray(themes) || themes.length === 0) {
      return NextResponse.json({ error: "Dati del viaggio incompleti" }, { status: 400 });
    }

    const itinerary = await generateTrip({
      destination,
      people,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      themes,
      budgetPerPerson: budgetPerPerson ?? 0,
    });

    const durationDays = itinerary.days.length;

    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: userId ?? null,
        destination_name: destination,
        start_date: startDate ?? null,
        duration_days: durationDays,
        themes,
        title: itinerary.title,
        subtitle: itinerary.subtitle,
        itinerary: itinerary.days,
        budget_estimate: {
          per_person: budgetPerPerson ?? 0,
          total: (budgetPerPerson ?? 0) * people,
          currency: "EUR",
        },
      })
      .select("id")
      .single();

    if (error) {
      // Non blocchiamo l'utente se il salvataggio fallisce: l'itinerario
      // generato viene comunque restituito, semplicemente non resterà
      // salvato nello storico.
      console.error("[Elly] Errore nel salvare il viaggio su Supabase:", error);
      return NextResponse.json({ trip: itinerary, tripId: null, saved: false });
    }

    return NextResponse.json({ trip: itinerary, tripId: data.id, saved: true });
  } catch (err) {
    console.error("[Elly] Errore nella generazione del viaggio:", err);
    const message = err instanceof Error ? err.message : "Errore interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
