"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export default function UserButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const avatarUrl =
    user?.user_metadata?.avatar_url || null;

  const initial =
    user?.user_metadata?.full_name?.[0] ||
    user?.user_metadata?.name?.[0] ||
    user?.email?.[0] ||
    "?";

  return (
    <Link
      href={user ? "/profilo" : "/auth"}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 50,
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        backgroundColor: user
          ? "rgba(139,92,246,0.15)"
          : "rgba(255,255,255,0.06)",
        border: user
          ? "1.5px solid rgba(139,92,246,0.35)"
          : "1.5px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        textDecoration: "none",
        transition: "all 0.2s",
      }}
      aria-label={user ? "Profilo" : "Accedi"}
    >
      {user && avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          width={36}
          height={36}
          style={{ objectFit: "cover" }}
          referrerPolicy="no-referrer"
        />
      ) : user ? (
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#8B5CF6",
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          {initial.toUpperCase()}
        </span>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </Link>
  );
}
