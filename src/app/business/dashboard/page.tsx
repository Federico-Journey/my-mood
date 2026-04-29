"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Business {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  description: string | null;
  cover_photo_url: string | null;
  is_verified: boolean;
  plan: string;
}

export default function BusinessDashboard() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/business/login"); return; }

      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_user_id", session.user.id)
        .single();

      if (!biz) { router.replace("/business/login"); return; }
      setBusiness(biz);

      const { count } = await supabase
        .from("business_photos")
        .select("*", { count: "exact", head: true })
        .eq("business_id", biz.id);
      setPhotoCount(count ?? 0);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) return <LoadingScreen />;

  const profileComplete = !!(business?.description && business?.address && photoCount > 0);

  return (
    <div style={{ padding: "40px 48px", maxWidth: "900px", color: "#F5F5F0" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0 }}>Benvenuto 👋</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", marginTop: "6px", fontSize: "14px" }}>{business?.name}</p>
      </div>

      {/* Alert profilo incompleto */}
      {!profileComplete && (
        <div style={{
          padding: "16px 20px", borderRadius: "14px", marginBottom: "28px",
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
          display: "flex", alignItems: "center", gap: "14px",
        }}>
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#FCD34D", fontWeight: 700, fontSize: "13px", margin: 0 }}>Profilo incompleto</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", margin: "3px 0 0" }}>
              Aggiungi descrizione, indirizzo e almeno una foto per essere visibile su My Mood.
            </p>
          </div>
          <Link href="/business/profilo" style={{
            padding: "8px 16px", borderRadius: "10px",
            background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)",
            color: "#FCD34D", fontSize: "12px", fontWeight: 700, textDecoration: "none",
          }}>
            Completa →
          </Link>
        </div>
      )}

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        <StatCard icon="🖼️" label="Foto caricate" value={photoCount} color="#8B5CF6" />
        <StatCard icon="✅" label="Stato profilo" value={profileComplete ? "Completo" : "Incompleto"} color={profileComplete ? "#10B981" : "#F59E0B"} />
        <StatCard icon="📋" label="Piano" value={business?.plan === "pro" ? "Pro ⭐" : "Free"} color="#6366F1" />
      </div>

      {/* Azioni rapide */}
      <h2 style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>
        Azioni rapide
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        <ActionCard
          href="/business/profilo"
          icon="🏪"
          title="Modifica profilo"
          desc="Aggiorna descrizione, foto e contatti del locale"
          color="#8B5CF6"
        />
        <ActionCard
          href="/business/profilo#foto"
          icon="📸"
          title="Gestisci foto"
          desc="Carica nuove foto per il carousel del tuo profilo"
          color="#EC4899"
        />
      </div>

      {/* Prossimamente */}
      <div style={{ marginTop: "32px", padding: "20px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
          Prossimamente
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {["🎟️ Pubblica eventi", "📊 Analytics visite", "📍 QR check-in"].map(item => (
            <span key={item} style={{
              padding: "6px 14px", borderRadius: "20px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.3)", fontSize: "12px",
            }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div style={{
      padding: "20px", borderRadius: "16px",
      background: "#0d0b16", border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{ fontSize: "22px" }}>{icon}</span>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", margin: "10px 0 4px", fontWeight: 600 }}>{label}</p>
      <p style={{ color, fontSize: "20px", fontWeight: 800, margin: 0 }}>{value}</p>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, color }: { href: string; icon: string; title: string; desc: string; color: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        padding: "20px", borderRadius: "16px",
        background: "#0d0b16", border: `1px solid ${color}20`,
        transition: "border-color 0.2s",
        cursor: "pointer",
      }}>
        <span style={{ fontSize: "24px" }}>{icon}</span>
        <p style={{ color: "#F5F5F0", fontSize: "14px", fontWeight: 700, margin: "10px 0 4px" }}>{title}</p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </Link>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ width: "28px", height: "28px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#8B5CF6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
