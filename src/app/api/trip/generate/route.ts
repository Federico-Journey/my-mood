import { NextRequest, NextResponse } from "next/server";
import { supabaseForRequest } from "@/lib/supabaseServer";
import { generateTrip, type GenerateTripInput } from "@/lib/tripGenerator";
import { logGenerationCosts } from "@/lib/costTracking";
import { attachGenerationTrip, refundGeneration, reserveGeneration } from "@/lib/entitlements";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, people, startDate, endDate, themes, budgetPerPerson, startTime, dinnerTime } = body as GenerateTripInput;
    // body.mode: "base" se l'utente ha scelto la versione base, altrimenti decide il server.
    // Il viaggio viene creato "senza proprietario": resta consultabile con il
    // suo link (condivisione, PDF, voti) ma NON compare nei viaggi dell'utente
    // finche' non preme "Salva" (in quel momento gli viene assegnato).
    const { db, userId } = await supabaseForRequest(request);
    if (!destination || !people || !themes || !Array.isArray(themes) || themes.length === 0) {
      return NextResponse.json({ error: "Dati del viaggio incompleti" }, { status: 400 });
    }

    // Versione di prova (archivio aperto, nessuna chiamata a Google) o completa (luoghi verificati):
    // dipende da abbonamento, viaggio gratuito o crediti (vedi src/lib/entitlements.ts).
    // L'utente può scegliere la versione base anche se ha viaggi completi disponibili:
    // in quel caso non consumiamo nulla.
    const gate = body.mode === "base" && userId
      ? { mode: "trial" as const, logId: null, source: null, paywall: "chosen_base" as const }
      : await reserveGeneration(userId);
    const mode = gate.mode;

    let generated;
    try {
      generated = await generateTrip({
        destination,
        people,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        themes,
        budgetPerPerson: budgetPerPerson ?? 0,
        startTime: startTime || "09:00",
        dinnerTime: dinnerTime || "20:00",
      }, { mode });
    } catch (err) {
      await refundGeneration(userId, gate.logId); // errore nostro: il viaggio non viene addebitato
      throw err;
    }
    const { trip: itinerary, costs } = generated;

    const durationDays = itinerary.days.length;

    const { data, error } = await db
      .from("trips")
      .insert({
        user_id: null,
        generation_mode: mode,
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
      // Il costo AI/Google e' stato comunque sostenuto anche se il salvataggio
      // del viaggio e' fallito: lo registriamo comunque, senza trip_id.
      void logGenerationCosts(null, costs);
      return NextResponse.json({ trip: itinerary, tripId: null, saved: false, paywall: gate.paywall });
    }

    void logGenerationCosts(data.id, costs);
    await attachGenerationTrip(userId, gate.logId, data.id);

    return NextResponse.json({ trip: itinerary, tripId: data.id, saved: true, paywall: gate.paywall });
  } catch (err) {
    console.error("[Elly] Errore nella generazione del viaggio:", err);
    const message = err instanceof Error ? err.message : "Errore interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
