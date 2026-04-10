"use client";

import { useState, useEffect, useRef } from "react";
import { MOODS, getPlan, type Plan } from "@/lib/data";
import { generatePlan } from "@/lib/planGenerator";
import SplashScreen from "@/components/SplashScreen";
import MoodSelector from "@/components/MoodSelector";
import CompanySelector from "@/components/CompanySelector";
import BudgetSelector from "@/components/BudgetSelector";
import LoadingScreen from "@/components/LoadingScreen";
import PlanView from "@/components/PlanView";
import ShareCard from "@/components/ShareCard";

type Screen = "splash" | "mood" | "company" | "budget" | "loading" | "plan";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [mood, setMood] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  // Ref per conservare il piano fetched mentre l'animazione di loading è in corso
  const pendingPlanRef = useRef<Plan | null>(null);

  // Accent color based on selected mood
  const selectedMood = MOODS.find((m) => m.id === mood);
  const accentColor = selectedMood?.color || "#8B5CF6";

  // Splash → Mood auto-transition
  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => setScreen("mood"), 2200);
      return () => clearTimeout(t);
    }
  }, [screen]);

  // Loading animation + fetch parallelo da Supabase
  useEffect(() => {
    if (screen === "loading" && mood && company && budget) {
      setLoadingProgress(0);
      pendingPlanRef.current = null;

      // Fetch da Supabase in parallelo con l'animazione
      generatePlan(mood, company, budget).then((fetchedPlan) => {
        pendingPlanRef.current = fetchedPlan;
      });

      // Animazione progress bar
      const steps = [12, 28, 45, 58, 72, 85, 93, 100];
      let i = 0;
      const interval = setInterval(() => {
        if (i < steps.length) {
          setLoadingProgress(steps[i]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            // Usa il piano da Supabase se disponibile, altrimenti fallback statico
            const finalPlan = pendingPlanRef.current ?? getPlan(mood, company, budget);
            setPlan(finalPlan);
            pendingPlanRef.current = null;
            setScreen("plan");
          }, 400);
        }
      }, 280);
      return () => clearInterval(interval);
    }
  }, [screen, mood, company, budget]);

  // Animate plan steps appearing one by one
  useEffect(() => {
    if (screen === "plan" && plan) {
      setVisibleSteps([]);
      plan.steps.forEach((_, i) => {
        setTimeout(() => setVisibleSteps((prev) => [...prev, i]), 300 + i * 250);
      });
    }
  }, [screen, plan]);

  // Handler: select mood
  const handleMoodSelect = (moodId: string) => {
    setMood(moodId);
    setScreen("company");
  };

  // Handler: select company
  const handleCompanySelect = (companyId: string) => {
    setCompany(companyId);
    setScreen("budget");
  };

  // Handler: select budget → trigger loading + fetch
  const handleBudgetSelect = (budgetId: string) => {
    setBudget(budgetId);
    setScreen("loading");
  };

  // Handler: regenera piano (nuova selezione casuale di venue)
  const handleRegenerate = () => {
    setVisibleSteps([]);
    setPlan(null);
    setScreen("loading");
  };

  // Handler: ricomincia da capo
  const handleNewMood = () => {
    setMood(null);
    setCompany(null);
    setBudget(null);
    setPlan(null);
    setVisibleSteps([]);
    setScreen("mood");
  };

  return (
    <main className="min-h-screen">
      {screen === "splash" && <SplashScreen />}

      {screen === "mood" && <MoodSelector onSelect={handleMoodSelect} />}

      {screen === "company" && (
        <CompanySelector
          accentColor={accentColor}
          onSelect={handleCompanySelect}
          onBack={() => setScreen("mood")}
        />
      )}

      {screen === "budget" && (
        <BudgetSelector
          accentColor={accentColor}
          onSelect={handleBudgetSelect}
          onBack={() => setScreen("company")}
        />
      )}

      {screen === "loading" && (
        <LoadingScreen progress={loadingProgress} accentColor={accentColor} />
      )}

      {screen === "plan" && plan && (
        <PlanView
          plan={plan}
          mood={mood!}
          accentColor={accentColor}
          visibleSteps={visibleSteps}
          onRegenerate={handleRegenerate}
          onNewMood={handleNewMood}
          onShare={() => setShowShareCard(true)}
        />
      )}

      {/* Share card overlay */}
      {showShareCard && plan && (
        <ShareCard
          plan={plan}
          mood={mood!}
          accentColor={accentColor}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </main>
  );
}
