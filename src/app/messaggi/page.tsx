"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchMyMessages,
  markMessagesRead,
  sendPlanMessage,
  type PlanMessage,
} from "@/lib/community";
import type { User } from "@supabase/supabase-js";
import NavBar from "@/components/NavBar";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Raggruppa i messaggi per piano+interlocutore
function groupConversations(messages: PlanMessage[], userId: string) {
  const map = new Map<string, { messages: PlanMessage[]; otherId: string; otherName: string | null; otherAvatar: string | null; planTitle: string | null; planId: string; unread: number }>();

  for (const m of messages) {
    const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
    const key = `${m.plan_id}_${otherId}`;
    if (!map.has(key)) {
      map.set(key, {
        messages: [],
        otherId,
        otherName: m.sender_id !== userId ? m.sender_name : null,
        otherAvatar: m.sender_id !== userId ? m.sender_avatar : null,
        planTitle: m.plan_title,
        planId: m.plan_id,
        unread: 0,
      });
    }
    const conv = map.get(key)!;
    conv.messages.push(m);
    if (!m.is_read && m.receiver_id === userId) conv.unread++;
    // Aggiorna il nome dell'altro se lo troviamo
    if (m.sender_id === otherId && m.sender_name) conv.otherName = m.sender_name;
    if (m.sender_id === otherId && m.sender_avatar) conv.otherAvatar = m.sender_avatar;
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.messages[0]?.created_at ?? 0).getTime() -
      new Date(a.messages[0]?.created_at ?? 0).getTime()
  );
}

export default function MessaggiPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<PlanMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<ReturnType<typeof groupConversations>[0] | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async (u: User) => {
    const msgs = await fetchMyMessages(u.id);
    setMessages(msgs);
    await markMessagesRead(u.id);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { router.push("/auth"); return; }
      setUser(session.user);
      loadMessages(session.user);
    });
  }, [router, loadMessages]);

  const conversations = user ? groupConversations(messages, user.id) : [];

  const handleReply = async () => {
    if (!user || !activeConv || !replyText.trim()) return;
    setSending(true);
    await sendPlanMessage(activeConv.planId, user.id, activeConv.otherId, replyText.trim());
    setReplyText("");
    setSending(false);
    await loadMessages(user);
    // Riapri la conversazione aggiornata
    const updated = groupConversations(
      await fetchMyMessages(user.id),
      user.id
    ).find((c) => c.planId === activeConv.planId && c.otherId === activeConv.otherId);
    if (updated) setActiveConv(updated);
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "40vh" }}>
          <Spinner />
        </div>
        <NavBar />
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      {/* Header */}
      <div style={{ padding: "20px 20px 12px", maxWidth: "480px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/community" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "14px" }}>
          ← Social
        </Link>
        <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#F5F5F0", flex: 1 }}>Messaggi</h1>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "0 16px 100px" }}>
        {conversations.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>💬</div>
            <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)" }}>
              Nessun messaggio ancora
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", marginTop: "6px" }}>
              Vai nel feed Social e scrivi a qualcuno!
            </div>
          </div>
        ) : (
          conversations.map((conv, i) => (
            <button
              key={i}
              onClick={() => setActiveConv(conv)}
              style={{
                width: "100%",
                textAlign: "left",
                background: activeConv === conv ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeConv === conv ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "16px",
                padding: "14px",
                marginBottom: "10px",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                transition: "all 0.2s",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(139,92,246,0.15)",
                  border: "1.5px solid rgba(139,92,246,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {conv.otherAvatar ? (
                  <img src={conv.otherAvatar} alt="" width={40} height={40} style={{ objectFit: "cover" }} referrerPolicy="no-referrer" />
                ) : (
                  <span style={{ color: "#8B5CF6", fontWeight: 700 }}>
                    {(conv.otherName || "?")[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: conv.unread > 0 ? 700 : 500, color: "#F5F5F0" }}>
                    {conv.otherName || "Utente"}
                  </span>
                  {conv.unread > 0 && (
                    <span
                      style={{
                        background: "#EF4444",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 700,
                        borderRadius: "10px",
                        padding: "2px 7px",
                      }}
                    >
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>
                  📋 {conv.planTitle || "Piano"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: conv.unread > 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {conv.messages[0]?.message}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Conversation thread drawer */}
      {activeConv && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 80,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setActiveConv(null); }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              maxHeight: "75vh",
              background: "#141418",
              borderRadius: "24px 24px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Thread header */}
            <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#F5F5F0" }}>
                  {activeConv.otherName || "Utente"}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                  📋 {activeConv.planTitle}
                </div>
              </div>
              <button onClick={() => setActiveConv(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "22px", lineHeight: 1 }}>
                ×
              </button>
            </div>

            {/* Messages list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[...activeConv.messages].reverse().map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "10px 14px",
                        borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: isMe ? "#8B5CF6" : "rgba(255,255,255,0.07)",
                        color: isMe ? "#fff" : "rgba(255,255,255,0.8)",
                        fontSize: "14px",
                        lineHeight: 1.4,
                      }}
                    >
                      {msg.message}
                    </div>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "3px" }}>
                      {new Date(msg.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Reply input */}
            <div
              style={{
                padding: "12px 14px",
                paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: "8px",
              }}
            >
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                placeholder="Scrivi un messaggio..."
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#F5F5F0",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                style={{
                  padding: "11px 16px",
                  borderRadius: "12px",
                  background: replyText.trim() ? "#8B5CF6" : "rgba(255,255,255,0.05)",
                  border: "none",
                  color: replyText.trim() ? "#fff" : "rgba(255,255,255,0.3)",
                  fontSize: "16px",
                  cursor: replyText.trim() ? "pointer" : "default",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      <NavBar />
    </main>
  );
}

function Spinner() {
  return (
    <>
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#0D0D0D",
  color: "#F5F5F0",
  fontFamily: '"DM Sans", sans-serif',
};
