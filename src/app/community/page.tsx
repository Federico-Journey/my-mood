"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchPublicPlans,
  toggleLike,
  sendPlanMessage,
  type PublicPlan,
} from "@/lib/community";
import { MOODS } from "@/lib/data";
import type { User } from "@supabase/supabase-js";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import MoonHeader from "@/components/MoonHeader";

export default function CommunityPage() {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [messageModal, setMessageModal] = useState<PublicPlan | null>(null);

  const loadPlans = useCallback(async (u: User | null) => {
    setLoading(true);
    const data = await fetchPublicPlans(u?.id);
    setPlans(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadPlans(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [loadPlans]);

  const handleLike = async (plan: PublicPlan) => {
    if (!user) return;
    // Aggiorna ottimisticamente la UI
    setPlans((prev) =>
      prev.map((p) =>
        p.id === plan.id
          ? {
              ...p,
              user_liked: !p.user_liked,
              likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );
    await toggleLike(plan.id, user.id, plan.user_liked);
  };

  return (
    <main style={pageStyle}>
      {/* Header */}
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <MoonHeader
          title="Social"
          subtitle="Piani pubblicati dalla community di Milano"
          right={
            user ? (
              <Link
                href="/messaggi"
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  padding: "7px 14px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                💬 <span style={{ fontSize: "12px" }}>Messaggi</span>
              </Link>
            ) : null
          }
        />
      </div>

      {/* Feed */}
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "0 16px 100px" }}>
        {loading ? (
          <SkeletonFeed />
        ) : plans.length === 0 ? (
          <EmptyState />
        ) : (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              user={user}
              onLike={() => handleLike(plan)}
              onMessage={() => setMessageModal(plan)}
            />
          ))
        )}
      </div>

      {/* Message modal */}
      {messageModal && (
        <MessageModal
          plan={messageModal}
          user={user}
          onClose={() => setMessageModal(null)}
        />
      )}

      <NavBar />
    </main>
  );
}

/* ─── Plan Card ─────────────────────────────────────────────── */

function PlanCard({
  plan,
  user,
  onLike,
  onMessage,
}: {
  plan: PublicPlan;
  user: User | null;
  onLike: () => void;
  onMessage: () => void;
}) {
  const mood = MOODS.find((m) => m.id === plan.mood_id);
  const accent = plan.accent_color || "#8B5CF6";
  const planData = plan.plan_data as { steps?: { img?: string; name: string; time: string }[] };
  const steps = planData?.steps ?? [];
  const isOwn = user?.id === plan.user_id;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}g fa`;
    if (h > 0) return `${h}h fa`;
    return "poco fa";
  };

  return (
    <div
      style={{
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.07)",
        background: `linear-gradient(135deg, ${accent}0a, rgba(255,255,255,0.02))`,
        marginBottom: "16px",
        overflow: "hidden",
      }}
    >
      {/* Card header: autore + mood */}
      <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Avatar */}
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: `${accent}20`,
            border: `1.5px solid ${accent}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {plan.author_avatar ? (
            <img src={plan.author_avatar} alt="" width={38} height={38} style={{ objectFit: "cover" }} referrerPolicy="no-referrer" />
          ) : (
            <span style={{ color: accent, fontWeight: 700 }}>
              {(plan.author_name || "?")[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#F5F5F0", lineHeight: 1.2 }}>
            {plan.author_name || "Utente"}
            {isOwn && (
              <span style={{ fontSize: "11px", color: accent, marginLeft: "6px", fontWeight: 500 }}>tu</span>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
            {timeAgo(plan.created_at)}
          </div>
        </div>

        {/* Mood badge */}
        {mood && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "20px",
              background: `${accent}18`,
              border: `1px solid ${accent}35`,
              color: accent,
              flexShrink: 0,
            }}
          >
            {mood.emoji} {mood.label}
          </span>
        )}
      </div>

      {/* Plan title */}
      <div style={{ padding: "0 16px 10px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#F5F5F0", margin: 0 }}>
          {plan.title}
        </h3>
      </div>

      {/* Steps preview */}
      {steps.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            padding: "0 16px 12px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {steps.slice(0, 4).map((step, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                padding: "6px 10px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.06)",
                fontSize: "12px",
                color: "rgba(255,255,255,0.55)",
                whiteSpace: "nowrap",
              }}
            >
              {step.img || "📍"} {step.name}
            </div>
          ))}
          {steps.length > 4 && (
            <div
              style={{
                flexShrink: 0,
                padding: "6px 10px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
                fontSize: "12px",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              +{steps.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "0 16px" }} />

      {/* Actions: like + scrivi */}
      <div style={{ padding: "10px 16px", display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={onLike}
          disabled={!user || isOwn}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "7px 14px",
            borderRadius: "20px",
            border: plan.user_liked
              ? "1px solid rgba(239,68,68,0.4)"
              : "1px solid rgba(255,255,255,0.08)",
            background: plan.user_liked
              ? "rgba(239,68,68,0.12)"
              : "rgba(255,255,255,0.03)",
            color: plan.user_liked ? "#F87171" : "rgba(255,255,255,0.4)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: !user || isOwn ? "default" : "pointer",
            opacity: !user && !plan.user_liked ? 0.5 : 1,
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >
          {plan.user_liked ? "❤️" : "🤍"} {plan.likes_count}
        </button>

        {!isOwn && (
          <button
            onClick={onMessage}
            disabled={!user}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "7px 14px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: user ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: !user ? "default" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            💬 Scrivi
          </button>
        )}

        {!user && (
          <Link
            href="/auth"
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              color: "rgba(255,255,255,0.25)",
              textDecoration: "none",
            }}
          >
            Accedi per interagire →
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── Message Modal ─────────────────────────────────────────── */

function MessageModal({
  plan,
  user,
  onClose,
}: {
  plan: PublicPlan;
  user: User | null;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!user || !text.trim()) return;
    setSending(true);
    const ok = await sendPlanMessage(plan.id, user.id, plan.user_id, text.trim());
    setSending(false);
    if (ok) {
      setSent(true);
      setTimeout(onClose, 1800);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#141418",
          borderRadius: "24px 24px 0 0",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "24px 20px",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#F5F5F0" }}>
              Scrivi a {plan.author_name || "questo utente"}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
              Re: {plan.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "20px" }}
          >
            ×
          </button>
        </div>

        {sent ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              fontSize: "15px",
              color: "#4ade80",
              fontWeight: 600,
            }}
          >
            ✓ Messaggio inviato!
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ciao! Posso unirmi al vostro piano? / Questo posto mi sembra perfetto, usciamo insieme?"
              rows={4}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#F5F5F0",
                fontSize: "14px",
                fontFamily: '"DM Sans", sans-serif',
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "12px",
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "14px",
                background: "#8B5CF6",
                border: "none",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: sending || !text.trim() ? "default" : "pointer",
                opacity: !text.trim() ? 0.5 : 1,
                fontFamily: "inherit",
              }}
            >
              {sending ? "Invio..." : "Invia messaggio"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Skeleton + Empty ──────────────────────────────────────── */

function SkeletonFeed() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            marginBottom: "16px",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: "14px", background: "rgba(255,255,255,0.06)", borderRadius: "6px", width: "40%", marginBottom: "6px" }} />
              <div style={{ height: "10px", background: "rgba(255,255,255,0.04)", borderRadius: "6px", width: "25%" }} />
            </div>
          </div>
          <div style={{ height: "18px", background: "rgba(255,255,255,0.06)", borderRadius: "6px", width: "70%", marginBottom: "12px" }} />
          <div style={{ display: "flex", gap: "6px" }}>
            {[1, 2, 3].map((j) => (
              <div key={j} style={{ height: "30px", width: "80px", background: "rgba(255,255,255,0.04)", borderRadius: "10px" }} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", paddingTop: "60px" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌙</div>
      <div style={{ fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
        Nessun piano pubblicato ancora
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>
        Genera un piano e pubblicalo nel feed!
      </div>
    </div>
  );
}

/* ─── Style ─────────────────────────────────────────────────── */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#0D0D0D",
  color: "#F5F5F0",
  fontFamily: '"DM Sans", sans-serif',
};
