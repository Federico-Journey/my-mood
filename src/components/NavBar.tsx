"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { countUnreadMessages } from "@/lib/community";

const LEFT_TABS = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/esplora",
    label: "Esplora",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
];

const RIGHT_TABS = [
  {
    href: "/community",
    label: "Social",
    isSocial: true,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        <path d="M16 3.13a4 4 0 010 7.75" />
        <path d="M21 21v-2a4 4 0 00-3-3.87" />
      </svg>
    ),
  },
  {
    href: "/profilo",
    label: "Profilo",
    isSocial: false,
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export default function NavBar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const isCenterActive = pathname === "/genera" || pathname.startsWith("/genera/");

  useEffect(() => {
    const checkUnread = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const count = await countUnreadMessages(session.user.id);
      setUnread(count);
    };
    checkUnread();
    const interval = setInterval(checkUnread, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(7,7,14,0.90)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around max-w-[480px] mx-auto h-[66px] relative">

        {/* Left tabs */}
        {LEFT_TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-200 relative"
              style={{ color: active ? "#8B5CF6" : "rgba(255,255,255,0.32)" }}
            >
              {active && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: "24px", height: "2px", borderRadius: "2px", background: "#8B5CF6",
                  boxShadow: "0 0 8px rgba(139,92,246,0.9), 0 0 20px rgba(139,92,246,0.4)",
                }} />
              )}
              <div style={{ filter: active ? "drop-shadow(0 0 5px rgba(139,92,246,0.55))" : "none", transition: "filter 0.25s" }}>
                {tab.icon(active)}
              </div>
              <span className="text-[9px] font-semibold tracking-wide" style={{ color: active ? "#8B5CF6" : "rgba(255,255,255,0.28)" }}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Center floating Mood button */}
        <div className="flex-1 flex justify-center items-center relative">
          <Link
            href="/genera"
            style={{
              position: "absolute",
              bottom: "12px",
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              background: isCenterActive
                ? "linear-gradient(135deg, #A78BFA, #7C3AED)"
                : "linear-gradient(135deg, #8B5CF6, #6D28D9)",
              boxShadow: isCenterActive
                ? "0 0 0 4px rgba(139,92,246,0.25), 0 6px 28px rgba(139,92,246,0.55)"
                : "0 4px 20px rgba(139,92,246,0.45)",
              transform: isCenterActive ? "scale(1.05)" : "scale(1)",
              transition: "all 0.25s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: "22px", lineHeight: 1 }}>🌙</span>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "rgba(255,255,255,0.75)", letterSpacing: "0.5px", marginTop: "1px" }}>MOOD</span>
          </Link>
        </div>

        {/* Right tabs */}
        {RIGHT_TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-200 relative"
              style={{ color: active ? "#8B5CF6" : "rgba(255,255,255,0.32)" }}
            >
              {active && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: "24px", height: "2px", borderRadius: "2px", background: "#8B5CF6",
                  boxShadow: "0 0 8px rgba(139,92,246,0.9), 0 0 20px rgba(139,92,246,0.4)",
                }} />
              )}
              <div className="relative" style={{ filter: active ? "drop-shadow(0 0 5px rgba(139,92,246,0.55))" : "none", transition: "filter 0.25s" }}>
                {tab.icon(active)}
                {tab.isSocial && unread > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: "#EF4444" }}>
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-semibold tracking-wide" style={{ color: active ? "#8B5CF6" : "rgba(255,255,255,0.28)" }}>
                {tab.label}
              </span>
            </Link>
          );
        })}

      </div>
    </nav>
  );
}
