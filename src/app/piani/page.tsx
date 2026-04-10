"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MOODS } from "@/lib/data";
import type { User } from "@supabase/supabase-js";

type SavedPlan = {
  id: string;
  mood_id: string;
  accent_color: string;
  title: string;
  created_at: string;
};

export default function PianiPage() {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("user_plans")
          .select("id, mood_id, accent_color, title, created_at")
          .eq("user_id", u.id)
          .order("created_at", { ascending: false });
        setPlans(data ?? []);
      }
      setLoading(false);
    });
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("user_plans").delete().eq("id", id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <Link
            href="/"
            style={{
              color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ← Home
          </Link>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "16px" }}>🌙</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", letterSpacing: "3px", fontWeight: 700, textTransform: "uppercase" }}>
              my mood
            </span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            I miei piani
          </h1>
          {user && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginTop: "4px" }}>
              {user.email}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>Carico i tuoi piani...</div>
          </div>
        )}

        {/* Non loggato */}
        {!loading && !user && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", marginBottom: "24px" }}>
              Accedi per vedere i tuoi piani salvati
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Torna all&apos;app
            </Link>
          </div>
        )}

        {/* Nessun piano */}
        {!loading && user && plans.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗂️</div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", marginBottom: "24px" }}>
              Non hai ancora salvato nessun piano
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                borderRadius: "16px",
                background: "#8B5CF6",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              🌙 Genera il tuo primo piano
            </Link>
          </div>
        )}

        {/* Lista piani */}
        {!loading && user && plans.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {plans.map((plan) => {
              const mood = MOODS.find((m) => m.id === plan.mood_id);
              const color = plan.accent_color;
              return (
                <div
                  key={plan.id}
                  style={{
                    borderRadius: "20px",
                    border: `1px solid ${color}20`,
                    background: `linear-gradient(135deg, ${color}0a, rgba(255,255,255,0.02))`,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Left accent */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: `linear-gradient(to bottom, ${color}, ${color}40)` }} />

                  <Link
                    href={`/piani/${plan.id}`}
                    style={{ display: "block", padding: "18px 18px 18px 22px", textDecoration: "none" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: "0 0 4px", letterSpacing: "0.5px" }}>
                          {mood?.emoji} {mood?.label ?? plan.mood_id} · {formatDate(plan.created_at)}
                        </p>
                        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "17px", margin: 0, letterSpacing: "-0.3px" }}>
                          {plan.title}
                        </h3>
                      </div>
                      <span style={{ color: color, fontSize: "18px", flexShrink: 0, marginTop: "2px" }}>→</span>
                    </div>
                  </Link>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(plan.id)}
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "14px",
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.15)",
                      fontSize: "11px",
                      cursor: "pointer",
                      padding: "4px 6px",
                    }}
                  >
                    elimina
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && user && (
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <button
              onClick={() => supabase.auth.signOut().then(() => setUser(null))}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.2)",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Esci dall&apos;account
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
