"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MOODS, STEP_TYPE_COLORS, type Plan } from "@/lib/data";

type SavedPlan = {
  id: string;
  mood_id: string;
  accent_color: string;
  title: string;
  plan_data: Plan;
  created_at: string;
};

export default function PianoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("user_plans")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setSavedPlan(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontFamily: "system-ui" }}>Carico...</span>
      </main>
    );
  }

  if (!savedPlan) {
    return (
      <main style={{ minHeight: "100vh", background: "#09090f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Piano non trovato</p>
        <Link href="/piani" style={{ color: "#8B5CF6", marginTop: "12px" }}>← I miei piani</Link>
      </main>
    );
  }

  const plan = savedPlan.plan_data;
  const accentColor = savedPlan.accent_color;
  const mood = MOODS.find((m) => m.id === savedPlan.mood_id);
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#09090f",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "32px 20px 60px",
      }}
    >
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        {/* Back */}
        <Link
          href="/piani"
          style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "24px" }}
        >
          ← I miei piani
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <span style={{ borderRadius: "100px", padding: "5px 12px", fontSize: "12px", fontWeight: 700, background: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor }}>
              {mood?.emoji} {mood?.label}
            </span>
            <span style={{ borderRadius: "100px", padding: "5px 12px", fontSize: "12px", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              📅 {formatDate(savedPlan.created_at)}
            </span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "30px", fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            {plan.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "14px", margin: 0 }}>
            {plan.subtitle}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: `linear-gradient(to right, ${accentColor}30, transparent)`, marginBottom: "24px" }} />

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px" }}>
          {plan.steps.map((step, i) => {
            const typeColor = STEP_TYPE_COLORS[step.type] || accentColor;
            const cardContent = (
              <>
                <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: `linear-gradient(to bottom, ${typeColor}, ${typeColor}40)`, borderRadius: "3px 0 0 3px" }} />
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", background: `${typeColor}14`, border: `1px solid ${typeColor}25`, flexShrink: 0 }}>
                    {step.img}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>{step.name}</span>
                      <span style={{ color: typeColor, fontWeight: 700, fontSize: "12px", opacity: 0.85, flexShrink: 0 }}>{step.time}</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", margin: "0 0 8px" }}>📍 {step.address}</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                </div>
              </>
            );

            return step.venue_id ? (
              <Link
                key={i}
                href={`/venue/${step.venue_id}`}
                style={{ display: "block", borderRadius: "18px", padding: "16px", background: `linear-gradient(135deg, ${typeColor}08, rgba(255,255,255,0.02))`, border: `1px solid ${typeColor}18`, position: "relative", overflow: "hidden", textDecoration: "none" }}
              >
                {cardContent}
              </Link>
            ) : (
              <div
                key={i}
                style={{ borderRadius: "18px", padding: "16px", background: `linear-gradient(135deg, ${typeColor}08, rgba(255,255,255,0.02))`, border: `1px solid ${typeColor}18`, position: "relative", overflow: "hidden" }}
              >
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "15px", borderRadius: "18px", background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`, boxShadow: `0 4px 24px ${accentColor}30`, color: "#fff", fontWeight: 700, fontSize: "15px", textDecoration: "none" }}
        >
          🌙 Genera un nuovo piano
        </Link>
      </div>
    </main>
  );
}
