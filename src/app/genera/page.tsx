"use client";

import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { MOODS, getPlan, type Plan } from "@/lib/data";
import { generatePlan } from "@/lib/planGenerator";
import { supabase } from "@/lib/supabase";
import MoodSelector from "@/components/MoodSelector";
import CompanySelector from "@/components/CompanySelector";
import BudgetSelector from "@/components/BudgetSelector";
import ActivitySelector, { type ActivityMode } from "@/components/ActivitySelector";
import NeighborhoodSelector, { type NeighborhoodId } from "@/components/NeighborhoodSelector";
import LoadingScreen from "@/components/LoadingScreen";
import PlanView from "@/components/PlanView";
import NavBar from "@/components/NavBar";
import ShareCard from "@/components/ShareCard";
import LoginModal from "@/components/LoginModal";

type Screen = "mood" | "company" | "budget" | "activities" | "neighborhood" | "loading" | "plan";

export default function GeneraPage() {
  const [screen, setScreen] = useState<Screen>("mood");
  const [moods, setMoods] = useState<string[]>([]);
  const [company, setCompany] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityMode | null>(null);
  const [neighborhood, setNeighborhood] = useState<NeighborhoodId | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [planSaved, setPlanSaved] = useState(false);
  const [planPublished, setPlanPublished] = useState(false);
  const savedPlanIdRef = useRef<string | null>(null);
  const pendingPlanRef = useRef<Plan | null>(null);

  // Ripristina stato piano da sessionStorage (es. ritorno da pagina venue)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mymood_plan_state");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.screen === "plan" && saved.plan) {
        setMoods(saved.moods ?? []);
        setCompany(saved.company ?? null);
        setBudget(saved.budget ?? null);
        setActivities(saved.activities ?? null);
        setNeighborhood(saved.neighborhood ?? null);
        setPlan(saved.plan);
        setVisibleSteps((saved.plan.steps ?? []).map((_: unknown, i: number) => i));
        setScreen("plan");
      }
    } catch { /* ignore */ }
  }, []);

  // Salva stato piano in sessionStorage
  useEffect(() => {
    if (screen === "plan" && plan) {
      sessionStorage.setItem("mymood_plan_state", JSON.stringify({
        screen: "plan", moods, company, budget, activities, neighborhood, plan,
      }));
    }
  }, [screen, plan, moods, company, budget, activities, neighborhood]);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const selectedMood = MOODS.find((m) => m.id === moods[0]);
  const accentColor = selectedMood?.color || "#8B5CF6";

  // Loading animation + fetch
  useEffect(() => {
    if (screen === "loading" && moods.length > 0 && company && budget) {
      setLoadingProgress(0);
      pendingPlanRef.current = null;
      generatePlan(moods, company, budget, activities ?? undefined, neighborhood ?? undefined).then((fetchedPlan) => {
        pendingPlanRef.current = fetchedPlan;
      });
      const steps = [12, 28, 45, 58, 72, 85, 93, 100];
      let i = 0;
      const interval = setInterval(() => {
        if (i < steps.length) {
          setLoadingProgress(steps[i]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            const finalPlan = pendingPlanRef.current ?? getPlan(moods[0] ?? '', company, budget);
            setPlan(finalPlan);
            pendingPlanRef.current = null;
            setScreen("plan");
          }, 400);
        }
      }, 280);
      return () => clearInterval(interval);
    }
  }, [screen, moods, company, budget]);

  // Animate plan steps
  useEffect(() => {
    if (screen === "plan" && plan) {
      setVisibleSteps([]);
      plan.steps.forEach((_, i) => {
        setTimeout(() => setVisibleSteps((prev) => [...prev, i]), 300 + i * 250);
      });
    }
  }, [screen, plan]);

  const handleMoodSelect = (moodIds: string[]) => { setMoods(moodIds); setScreen("company"); };
  const handleCompanySelect = (c: string) => { setCompany(c); setScreen("budget"); };
  const handleBudgetSelect = (b: string) => { setBudget(b); setScreen("activities"); };
  const handleActivitySelect = (a: ActivityMode) => { setActivities(a); setScreen("neighborhood"); };
  const handleNeighborhoodSelect = (n: NeighborhoodId) => { setNeighborhood(n); setScreen("loading"); };

  const handleSavePlan = async () => {
    if (!user) { setShowLoginModal(true); return; }
    if (!plan || moods.length === 0) return;
    const { data, error } = await supabase.from("user_plans").insert({
      user_id: user.id, mood_id: moods[0], accent_color: accentColor,
      plan_data: plan, title: plan.title, is_public: false,
    }).select("id").single();
    if (!error && data) { setPlanSaved(true); savedPlanIdRef.current = data.id; }
  };

  const handlePublishPlan = async () => {
    if (!user) { setShowLoginModal(true); return; }
    if (!plan || moods.length === 0) return;
    if (!savedPlanIdRef.current) {
      const { data, error } = await supabase.from("user_plans").insert({
        user_id: user.id, mood_id: moods[0], accent_color: accentColor,
        plan_data: plan, title: plan.title, is_public: true,
      }).select("id").single();
      if (!error && data) { savedPlanIdRef.current = data.id; setPlanSaved(true); setPlanPublished(true); }
    } else {
      const { error } = await supabase.from("user_plans").update({ is_public: true }).eq("id", savedPlanIdRef.current);
      if (!error) setPlanPublished(true);
    }
  };

  const handleRegenerate = () => {
    sessionStorage.removeItem("mymood_plan_state");
    setVisibleSteps([]); setPlan(null); setPlanSaved(false); setScreen("loading");
  };

  const handleNewMood = () => {
    sessionStorage.removeItem("mymood_plan_state");
    setMoods([]); setCompany(null); setBudget(null); setActivities(null);
    setNeighborhood(null); setPlan(null); setPlanSaved(false); setPlanPublished(false);
    savedPlanIdRef.current = null; setVisibleSteps([]); setScreen("mood");
  };

  return (
    <main className="min-h-screen">
      {screen === "mood" && <MoodSelector onSelect={handleMoodSelect} />}
      {screen === "company" && (
        <CompanySelector accentColor={accentColor} onSelect={handleCompanySelect} onBack={() => setScreen("mood")} />
      )}
      {screen === "budget" && (
        <BudgetSelector accentColor={accentColor} onSelect={handleBudgetSelect} onBack={() => setScreen("company")} />
      )}
      {screen === "activities" && (
        <ActivitySelector accentColor={accentColor} onSelect={handleActivitySelect} onBack={() => setScreen("budget")} />
      )}
      {screen === "neighborhood" && (
        <NeighborhoodSelector accentColor={accentColor} onSelect={handleNeighborhoodSelect} onBack={() => setScreen("activities")} />
      )}
      {screen === "loading" && (
        <LoadingScreen progress={loadingProgress} accentColor={accentColor} />
      )}
      {screen === "plan" && plan && (
        <PlanView
          plan={plan} mood={moods[0] ?? ''} accentColor={accentColor}
          visibleSteps={visibleSteps} user={user} planSaved={planSaved}
          planPublished={planPublished}
          onRegenerate={handleRegenerate} onNewMood={handleNewMood}
          onShare={() => setShowShareCard(true)} onSave={handleSavePlan}
          onPublish={handlePublishPlan}
        />
      )}
      {showShareCard && plan && (
        <ShareCard plan={plan} mood={moods[0] ?? ''} accentColor={accentColor} onClose={() => setShowShareCard(false)} />
      )}
      {showLoginModal && (
        <LoginModal accentColor={accentColor} onClose={() => setShowLoginModal(false)} />
      )}
      {(screen === "mood" || screen === "plan") && <NavBar />}
    </main>
  );
}
