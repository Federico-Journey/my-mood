"use client";

import { useState, useEffect } from "react";
import { MOODS, getPlan } from "@/lib/data";
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
  const [showShareCard, setShowShareCard] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

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

  // Loading animation
  useEffect(() => {
    if (screen === "loading") {
      setLoadingProgress(0);
      const steps = [12, 28, 45, 58, 72, 85, 93, 100];
      let i = 0;
      const interval = setInterval(() => {
        if (i < steps.length) {
          setLoadingProgress(steps[i]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setScreen("plan"), 400);
        }
      }, 280);
      return () => clearInterval(interval);
    }
  }, [screen]);

  // Animate plan steps appearing
  useEffect(() => {
    if (screen === "plan" && mood && company && budget) {
      setVisibleSteps([]);
      const plan = getPlan(mood, company, budget);
      plan.steps.forEach((_, i) => {
        setTimeout(() => setVisibleSteps((prev) => [...prev, i]), 300 + i * 250);
      });
    }
  }, [screen, mood, company, budget]);

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

  // Handler: select budget → trigger loading
  const handleBudgetSelect = (budgetId: string) => {
    setBudget(budgetId);
    setScreen("loading");
  };

  // Handler: regenerate (re-trigger loading animation)
  const handleRegenerate = () => {
    setVisibleSteps([]);
    setScreen("loading");
  };

  // Handler: start over
  const handleNewMood = () => {
    setMood(null);
    setCompany(null);
    setBudget(null);
    setVisibleSteps([]);
    setScreen("mood");
  };

  // Get the current plan
  const plan = mood && company && budget ? getPlan(mood, company, budget) : null;

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
