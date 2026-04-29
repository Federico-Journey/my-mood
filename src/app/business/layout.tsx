"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (pathname !== "/business/login") router.replace("/business/login");
        setChecking(false);
        return;
      }
      // Controlla se ha un business
      const { data: biz } = await supabase
        .from("businesses")
        .select("name")
        .eq("owner_user_id", session.user.id)
        .single();

      if (!biz && pathname !== "/business/login") {
        router.replace("/business/login");
      } else if (biz) {
        setBusinessName(biz.name);
      }
      setChecking(false);
    };
    check();
  }, [pathname, router]);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#08060f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "28px", height: "28px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#8B5CF6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isLogin = pathname === "/business/login";

  return (
    <div style={{ minHeight: "100vh", background: "#08060f", fontFamily: '"DM Sans", sans-serif' }}>
      {/* Sidebar — solo quando loggati */}
      {!isLogin && (
        <div style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: "220px",
          background: "#0d0b16", borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column", padding: "28px 16px",
          zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
            <span style={{ fontSize: "18px" }}>🌙</span>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#F5F5F0", letterSpacing: "1px" }}>MY MOOD</div>
              <div style={{ fontSize: "9px", color: "#8B5CF6", fontWeight: 700, letterSpacing: "2px" }}>BUSINESS</div>
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
            {[
              { href: "/business/dashboard", icon: "📊", label: "Dashboard" },
              { href: "/business/profilo", icon: "🏪", label: "Profilo venue" },
            ].map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "10px",
                    background: active ? "rgba(139,92,246,0.15)" : "transparent",
                    border: active ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                    color: active ? "#A78BFA" : "rgba(255,255,255,0.45)",
                    fontSize: "13px", fontWeight: active ? 700 : 500,
                    transition: "all 0.15s",
                  }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Business name + logout */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
            {businessName && (
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {businessName}
              </div>
            )}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push("/business/login"); }}
              style={{
                width: "100%", padding: "8px", borderRadius: "8px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.35)", fontSize: "12px", cursor: "pointer",
              }}
            >
              Esci
            </button>
          </div>
        </div>
      )}

      {/* Contenuto principale */}
      <div style={{ marginLeft: isLogin ? 0 : "220px", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
}
