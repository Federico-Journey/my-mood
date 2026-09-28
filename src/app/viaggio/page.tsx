"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DestinationInput from "@/components/DestinationInput";
import PeopleStepper from "@/components/PeopleStepper";
import DateRangePicker from "@/components/DateRangePicker";
import ThemeSelector from "@/components/ThemeSelector";
import TravelBudgetSelector from "@/components/TravelBudgetSelector";
import TripSummary from "@/components/TripSummary";
import GeneratingScreen from "@/components/GeneratingScreen";
import TripResult from "@/components/TripResult";
import type { GeneratedTrip, GenerateTripInput } from "@/lib/tripGenerator";

type Screen = "destinazione" | "persone" | "date" | "mood" | "budget" | "riepilogo" | "generando" | "risultato";

export default function ViaggioPage() {
  const [screen, setScreen] = useState<Screen>("destinazione");
  const [destination, setDestination] = useState("");
  const [people, setPeople] = useState(2);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [themes, setThemes] = useState<string[]>([]);
  const [budgetPerPerson, setBudgetPerPerson] = useState(700);
  const [generatedTrip, setGeneratedTrip] = useState<GeneratedTrip | null>(null);
  const [tripId, setTripId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const draft = (): GenerateTripInput => ({ destination, people, startDate, endDate, themes, budgetPerPerson });

  // Recupera l'utente loggato (per associare i viaggi generati a lui) e,
  // se l'URL contiene ?id=..., carica un viaggio già salvato invece di
  // ripartire dall'inizio (link da "I miei viaggi").
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const params = new URLSearchParams(window.location.search);
    const savedId = params.get("id");
    if (!savedId) return;

    setLoadingSaved(true);
    supabase
      .from("trips")
      .select("*")
      .eq("id", savedId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setTripId(data.id);
          setDestination(data.destination_name ?? "");
          setThemes(data.themes ?? []);
          setGeneratedTrip({
            title: data.title,
            subtitle: data.subtitle ?? "",
            days: data.itinerary ?? [],
          });
          setScreen("risultato");
        }
        setLoadingSaved(false);
      });
  }, []);

  const handleDestination = (d: string) => { setDestination(d); setScreen("persone"); };
  const handlePeople = (p: number) => { setPeople(p); setScreen("date"); };
  const handleDates = (start: string, end: string) => { setStartDate(start); setEndDate(end); setScreen("mood"); };
  const handleThemes = (t: string[]) => { setThemes(t); setScreen("budget"); };
  const handleBudget = (b: number) => { setBudgetPerPerson(b); setScreen("riepilogo"); };

  const handleGenerate = async () => {
    setScreen("generando");
    setGenerationError(null);
    try {
      const res = await fetch("/api/trip/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft(), userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore nella generazione dell'itinerario.");
      }
      setGeneratedTrip(data.trip as GeneratedTrip);
      setTripId(data.tripId ?? null);
      setScreen("risultato");
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Errore imprevisto.");
      setScreen("generando");
    }
  };

  const handleRefine = async (feedback: string): Promise<GeneratedTrip> => {
    if (!generatedTrip) throw new Error("Nessun itinerario da modificare.");
    const res = await fetch("/api/trip/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft(), tripId, currentTrip: generatedTrip, feedback }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Errore nella modifica dell'itinerario.");
    }
    const updated = data.trip as GeneratedTrip;
    setGeneratedTrip(updated);
    return updated;
  };

  const handleNewTrip = () => {
    setDestination(""); setPeople(2); setStartDate(null); setEndDate(null);
    setThemes([]); setBudgetPerPerson(700); setGeneratedTrip(null); setTripId(null); setGenerationError(null);
    setScreen("destinazione");
  };

  if (loadingSaved) {
    return (
      <main>
        <GeneratingScreen />
      </main>
    );
  }

  return (
    <main>
      {screen === "destinazione" && (
        <DestinationInput onSelect={handleDestination} />
      )}
      {screen === "persone" && (
        <PeopleStepper
          initialPeople={people}
          onSelect={handlePeople}
          onBack={() => setScreen("destinazione")}
        />
      )}
      {screen === "date" && (
        <DateRangePicker
          onSelect={handleDates}
          onBack={() => setScreen("persone")}
        />
      )}
      {screen === "mood" && (
        <ThemeSelector onSelect={handleThemes} onBack={() => setScreen("date")} />
      )}
      {screen === "budget" && (
        <TravelBudgetSelector
          people={people}
          initialBudget={budgetPerPerson}
          onSelect={handleBudget}
          onBack={() => setScreen("mood")}
        />
      )}
      {screen === "riepilogo" && (
        <TripSummary
          destination={destination}
          people={people}
          startDate={startDate}
          endDate={endDate}
          themes={themes}
          budgetPerPerson={budgetPerPerson}
          onEdit={() => setScreen("budget")}
          onGenerate={handleGenerate}
        />
      )}
      {screen === "generando" && (
        <GeneratingScreen
          error={generationError}
          onRetry={handleGenerate}
          onBack={() => setScreen("riepilogo")}
        />
      )}
      {screen === "risultato" && generatedTrip && (
        <TripResult trip={generatedTrip} tripId={tripId} onNewTrip={handleNewTrip} onRefine={handleRefine} />
      )}
    </main>
  );
}
