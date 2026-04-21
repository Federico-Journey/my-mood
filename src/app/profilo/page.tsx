"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MOODS } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import NavBar from "@/components/NavBar";

interface Profile {
  name: string;
  avatar_url: string;
  bio: string;
  favorite_moods: string[];
  default_budget: string | null;
}

const BUDGET_OPTIONS = [
  { id: "low", label: "€", desc: "Budget-friendly" },
  { id: "mid", label: "€€", desc: "Medio" },
  { id: "high", label: "€€€", desc: "Alto" },
  { id: "luxury", label: "€€€€", desc: "Lusso" },
];

const MAX_FAV_MOODS = 5;

export default function ProfiloPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [favMoods, setFavMoods] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);

  // ─── Load user + profile ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/auth");
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from("profiles")
        .select("name, avatar_url, bio, favorite_moods, default_budget")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setName(data.name || "");
        setBio(data.bio || "");
        setFavMoods(data.favorite_moods || []);
        setBudget(data.default_budget || null);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  // ─── Save profile ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("profiles")
      .update({
        name,
        bio,
        favorite_moods: favMoods,
        default_budget: budget,
      })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ─── Toggle favorite mood ────────────────────────────────────
  const toggleMood = (moodId: string) => {
    setFavMoods((prev) =>
      prev.includes(moodId)
        ? prev.filter((m) => m !== moodId)
        : prev.length < MAX_FAV_MOODS
          ? [...prev, moodId]
          : prev
    );
  };

  // ─── Logout ───────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "40vh" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid rgba(255,255,255,0.15)",
              borderTopColor: "#8B5CF6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    null;

  const userEmail = user?.email || "";

  return (
    <main style={pageStyle}>
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            color: "rgba(255,255,255,0.4)",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← my mood
        </Link>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Esci
        </button>
      </div>

      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "32px 24px 80px",
        }}
      >
        {/* Avatar + email */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "rgba(139,92,246,0.15)",
              border: "2px solid rgba(139,92,246,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              marginBottom: "14px",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                width={80}
                height={80}
                style={{ objectFit: "cover" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span style={{ fontSize: "32px", color: "#8B5CF6" }}>
                {(name || userEmail)[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>
            {userEmail}
          </p>
        </div>

        {/* ─── Name ────────────────────────────────────────────── */}
        <SectionLabel>Nome</SectionLabel>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Come ti chiami?"
          style={inputStyle}
        />

        {/* ─── Bio ─────────────────────────────────────────────── */}
        <SectionLabel>Bio</SectionLabel>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Una riga su di te..."
          rows={2}
          style={{ ...inputStyle, resize: "none" }}
        />

        {/* ─── Mood preferiti ──────────────────────────────────── */}
        <SectionLabel>
          Mood preferiti{" "}
          <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.25)" }}>
            ({favMoods.length}/{MAX_FAV_MOODS})
          </span>
        </SectionLabel>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "28px",
          }}
        >
          {MOODS.map((mood) => {
            const selected = favMoods.includes(mood.id);
            const disabled = !selected && favMoods.length >= MAX_FAV_MOODS;
            return (
              <button
                key={mood.id}
                onClick={() => toggleMood(mood.id)}
                disabled={disabled}
                style={{
                  padding: "8px 14px",
                  borderRadius: "20px",
                  border: `1px solid ${selected ? mood.color + "60" : "rgba(255,255,255,0.08)"}`,
                  backgroundColor: selected ? mood.color + "18" : "rgba(255,255,255,0.03)",
                  color: selected ? mood.color : "rgba(255,255,255,0.5)",
                  fontSize: "13px",
                  cursor: disabled ? "default" : "pointer",
                  opacity: disabled ? 0.35 : 1,
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {mood.emoji} {mood.label}
              </button>
            );
          })}
        </div>

        {/* ─── Budget predefinito ──────────────────────────────── */}
        <SectionLabel>Budget predefinito</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            marginBottom: "36px",
          }}
        >
          {BUDGET_OPTIONS.map((opt) => {
            const selected = budget === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setBudget(selected ? null : opt.id)}
                style={{
                  padding: "12px 8px",
                  borderRadius: "12px",
                  border: `1px solid ${selected ? "#8B5CF660" : "rgba(255,255,255,0.08)"}`,
                  backgroundColor: selected
                    ? "rgba(139,92,246,0.12)"
                    : "rgba(255,255,255,0.03)",
                  color: selected ? "#8B5CF6" : "rgba(255,255,255,0.5)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  textAlign: "center",
                }}
              >
                <div>{opt.label}</div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    marginTop: "2px",
                    opacity: 0.6,
                  }}
                >
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── I miei piani link ──────────────────────────────── */}
        <Link
          href="/piani"
          style={{
            display: "block",
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
            textDecoration: "none",
            fontSize: "14px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          📋 I miei piani salvati
        </Link>

        {/* ─── Save button ────────────────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            backgroundColor: saved
              ? "rgba(34,197,94,0.15)"
              : "#8B5CF6",
            border: saved ? "1px solid rgba(34,197,94,0.4)" : "none",
            color: saved ? "#4ade80" : "#fff",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.3s",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Salvataggio..." : saved ? "✓ Salvato" : "Salva profilo"}
        </button>

        {/* ─── Footer legale ──────────────────────────────────── */}
        <div
          style={{
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <Link
            href="/terms"
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: "12px",
              textDecoration: "none",
            }}
          >
            Termini di Servizio
          </Link>
          <Link
            href="/privacy"
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: "12px",
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </Link>
        </div>
      </div>
      <NavBar />
    </main>
  );
}

/* ─── Helper components ──────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "13px",
        fontWeight: 600,
        color: "rgba(255,255,255,0.45)",
        marginBottom: "8px",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </label>
  );
}

/* ─── Shared styles ──────────────────────────────── */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#0D0D0D",
  color: "#F5F5F0",
  fontFamily: '"DM Sans", sans-serif',
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#F5F5F0",
  fontSize: "15px",
  marginBottom: "20px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
