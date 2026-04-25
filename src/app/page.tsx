"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { MOODS } from "@/lib/data";
import NavBar from "@/components/NavBar";
import SplashScreen from "@/components/SplashScreen";
import type { User } from "@supabase/supabase-js";

interface UserPlan {
  id: string;
  title: string;
  mood_id: string;
  accent_color: string;
  is_public: boolean;
  created_at: string;
  likes_count?: number;
}

interface Profile {
  name: string;
  avatar_url: string | null;
}

const STARS = [
  { x: 8,  y: 18, s: 1,   o: 0.4 },
  { x: 25, y:  8, s: 1.5, o: 0.5 },
  { x: 72, y: 14, s: 1,   o: 0.35 },
  { x: 88, y:  6, s: 2,   o: 0.3 },
  { x: 55, y: 20, s: 1,   o: 0.45 },
  { x: 40, y:  5, s: 1,   o: 0.3 },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Mostra splash solo una volta per sessione
    const splashShown = sessionStorage.getItem("splashShown");
    if (!splashShown) {
      setShowSplash(true);
      sessionStorage.setItem("splashShown", "1");
      setTimeout(() => setShowSplash(false), 2200);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // Utente non loggato → vai alla pagina di auth
        setLoading(false);
        router.replace("/auth");
        return;
      }
      setUser(session.user);

      // Fetch profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("name, avatar_url, onboarding_complete")
        .eq("id", session.user.id)
        .single();

      // Se onboarding non completato → vai all'onboarding
      if (!prof || !prof.onboarding_complete) {
        router.replace("/onboarding");
        return;
      }

      if (prof) setProfile(prof as Profile);

      // Fetch user plans with like counts
      const { data: userPlans } = await supabase
        .from("user_plans")
        .select("id, title, mood_id, accent_color, is_public, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (userPlans && userPlans.length > 0) {
        // Fetch like counts
        const plansWithLikes = await Promise.all(
          userPlans.map(async (p) => {
            const { count } = await supabase
              .from("plan_likes")
              .select("*", { count: "exact", head: true })
              .eq("plan_id", p.id);
            return { ...p, likes_count: count ?? 0 };
          })
        );
        setPlans(plansWithLikes as UserPlan[]);
      }

      setLoading(false);
    };
    init();
  }, [router]);

  const isGuest = !user;
  const displayName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Mooder";

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const initial = displayName[0]?.toUpperCase() || "M";

  if (showSplash) return <SplashScreen />;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "28px", height: "28px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#8B5CF6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#09090f", color: "#F5F5F0", fontFamily: '"DM Sans", sans-serif', paddingBottom: "100px" }}>

      {/* ─── Header ───────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", paddingTop: "52px", paddingBottom: "8px" }}>
        {/* Purple glow */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: "300px", height: "200px",
          background: "radial-gradient(ellipse at top, rgba(139,92,246,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Stars */}
        {STARS.map((s, i) => (
          <div key={i} style={{
            position: "absolute", left: `${s.x}%`, top: `${s.y}px`,
            width: `${s.s}px`, height: `${s.s}px`, borderRadius: "50%",
            background: "white", opacity: s.o,
            animation: `twinkle ${3 + i * 0.4}s ease-in-out ${i * 0.6}s infinite alternate`,
          }} />
        ))}

        {/* Logo + Avatar row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>🌙</span>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>
              my mood
            </span>
          </div>
          {isGuest ? (
            <Link href="/auth" style={{
              textDecoration: "none", padding: "7px 14px", borderRadius: "20px",
              background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)",
              color: "#A78BFA", fontSize: "12px", fontWeight: 700,
            }}>
              Accedi
            </Link>
          ) : (
            <Link href="/profilo" style={{ textDecoration: "none" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(139,92,246,0.15))",
                border: "1.5px solid rgba(139,92,246,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" width={38} height={38} style={{ objectFit: "cover" }} referrerPolicy="no-referrer" />
                ) : (
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#A78BFA" }}>{initial}</span>
                )}
              </div>
            </Link>
          )}
        </div>

        {/* Welcome text */}
        <div style={{ padding: "20px 20px 8px", position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginBottom: "4px" }}>
            {isGuest ? "Benvenuto 👋" : "Bentornato 👋"}
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em", color: "#F5F5F0", margin: 0 }}>
            {isGuest ? "Ciao, Mooder!" : `Ciao, ${displayName}`}
          </h1>
        </div>
      </div>

      {/* ─── Big CTA — Genera Piano ──────────────────────────── */}
      <div style={{ padding: "16px 20px 8px" }}>
        <Link href="/genera" style={{ textDecoration: "none", display: "block" }}>
          <div style={{
            borderRadius: "22px",
            padding: "22px 24px",
            background: "linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(109,40,217,0.12) 100%)",
            border: "1px solid rgba(139,92,246,0.35)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -30, right: -20,
              width: "140px", height: "140px",
              background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
            }} />
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
              Pianifica la serata
            </p>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#F5F5F0", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Genera il tuo piano 🌙
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "0 0 16px", lineHeight: 1.5 }}>
              Scegli il mood, ricevi un piano su misura per stasera
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
              borderRadius: "14px", padding: "10px 18px",
              color: "#fff", fontWeight: 700, fontSize: "14px",
              boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
            }}>
              Inizia →
            </div>
          </div>
        </Link>
      </div>

      {/* ─── Guest banner ────────────────────────────────────── */}
      {isGuest && (
        <div style={{ padding: "8px 20px 4px" }}>
          <Link href="/auth" style={{ textDecoration: "none", display: "block" }}>
            <div style={{
              borderRadius: "16px", padding: "16px 18px",
              background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
              display: "flex", alignItems: "center", gap: "14px",
            }}>
              <span style={{ fontSize: "22px" }}>🔐</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#A78BFA", fontWeight: 700, fontSize: "13px", margin: 0 }}>Crea un account gratuito</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", margin: "3px 0 0" }}>Salva i piani, vota con gli amici e molto altro</p>
              </div>
              <span style={{ color: "#8B5CF6", fontSize: "18px" }}>→</span>
            </div>
          </Link>
        </div>
      )}

      {/* ─── I miei piani ────────────────────────────────────── */}
      <Section title="I miei piani" href={isGuest ? undefined : "/piani"}>
        {isGuest ? (
          <EmptySlot icon="🔒" text="Accedi per vedere i tuoi piani salvati" />
        ) : plans.length === 0 ? (
          <EmptySlot icon="📋" text="Nessun piano salvato ancora" subtext="Genera il tuo primo piano!" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {plans.map((plan) => {
              const mood = MOODS.find((m) => m.id === plan.mood_id);
              const color = plan.accent_color || mood?.color || "#8B5CF6";
              return (
                <Link key={plan.id} href={`/piani`} style={{ textDecoration: "none" }}>
                  <div style={{
                    borderRadius: "16px", padding: "14px 16px",
                    background: `linear-gradient(135deg, ${color}12, ${color}05)`,
                    border: `1px solid ${color}25`,
                    display: "flex", alignItems: "center", gap: "12px",
                  }}>
                    <span style={{ fontSize: "22px" }}>{mood?.emoji || "🌙"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#F5F5F0", fontWeight: 700, fontSize: "14px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {plan.title}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", margin: "2px 0 0" }}>
                        {plan.is_public ? "🌍 Pubblico" : "🔒 Privato"}
                      </p>
                    </div>
                    {plan.is_public && (plan.likes_count ?? 0) > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: color, fontSize: "12px", fontWeight: 700 }}>
                        <span>❤️</span>
                        <span>{plan.likes_count}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      {/* ─── Amici ───────────────────────────────────────────── */}
      <Section title="Amici">
        <ComingSoon icon="👥" label="Connetti con gli amici" desc="Scopri cosa pianificano i tuoi amici — presto!" />
      </Section>

      {/* ─── Posti preferiti ─────────────────────────────────── */}
      <Section title="Posti preferiti">
        <ComingSoon icon="⭐" label="Salva i tuoi posti" desc="Tieni traccia dei locali che ami a Milano — presto!" />
      </Section>

      <NavBar />
    </main>
  );
}

/* ─── Helper components ─────────────────────────── */

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 20px 4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.75)", margin: 0, letterSpacing: "-0.01em" }}>
          {title}
        </h3>
        {href && (
          <Link href={href} style={{ color: "#8B5CF6", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
            Vedi tutti →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptySlot({ icon, text, subtext }: { icon: string; text: string; subtext?: string }) {
  return (
    <div style={{
      borderRadius: "16px", padding: "20px",
      background: "rgba(255,255,255,0.025)",
      border: "1px dashed rgba(255,255,255,0.1)",
      textAlign: "center",
    }}>
      <p style={{ fontSize: "28px", margin: "0 0 8px" }}>{icon}</p>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>{text}</p>
      {subtext && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", margin: "4px 0 0" }}>{subtext}</p>}
    </div>
  );
}

function ComingSoon({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div style={{
      borderRadius: "16px", padding: "16px 18px",
      background: "rgba(255,255,255,0.025)",
      border: "1px dashed rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", gap: "14px",
      opacity: 0.6,
    }}>
      <span style={{ fontSize: "24px" }}>{icon}</span>
      <div>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", fontWeight: 600, margin: 0 }}>{label}</p>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", margin: "3px 0 0" }}>{desc}</p>
      </div>
      <div style={{ marginLeft: "auto", borderRadius: "8px", padding: "3px 8px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)", color: "#A78BFA", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
        SOON
      </div>
    </div>
  );
}
