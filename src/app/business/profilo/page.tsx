"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["Bar", "Cocktail bar", "Ristorante", "Aperitivo", "Club / Discoteca", "Caffè", "Wine bar", "Lounge", "Rooftop", "Altro"];
const NEIGHBORHOODS = ["navigli", "brera", "porta_venezia", "isola", "porta_nuova", "centro", "porta_romana", "sempione"];
const NEIGHBORHOOD_LABELS: Record<string, string> = {
  navigli: "Navigli", brera: "Brera", porta_venezia: "Porta Venezia",
  isola: "Isola", porta_nuova: "Porta Nuova", centro: "Centro / Duomo",
  porta_romana: "Porta Romana", sempione: "Sempione",
};

interface Photo { id: string; url: string; order_index: number; caption: string | null; }

export default function BusinessProfiloPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bizId, setBizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Bar");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("navigli");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");

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

      setBizId(biz.id);
      setName(biz.name ?? "");
      setDescription(biz.description ?? "");
      setCategory(biz.category ?? "Bar");
      setAddress(biz.address ?? "");
      setNeighborhood(biz.neighborhood ?? "navigli");
      setPhone(biz.phone ?? "");
      setWebsite(biz.website ?? "");
      setInstagram(biz.instagram ?? "");

      // Carica foto
      const { data: photosData } = await supabase
        .from("business_photos")
        .select("*")
        .eq("business_id", biz.id)
        .order("order_index");
      setPhotos(photosData ?? []);
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSave = async () => {
    if (!bizId) return;
    setSaving(true); setError(null);
    const { error: err } = await supabase
      .from("businesses")
      .update({ name, description, category, address, neighborhood, phone, website, instagram })
      .eq("id", bizId);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleUploadPhoto = async (files: FileList | null) => {
    if (!files || !bizId) return;
    setUploading(true); setError(null);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) { setError("Dimensione massima per foto: 5MB"); continue; }

      const ext = file.name.split(".").pop();
      const path = `${bizId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("business-photos")
        .upload(path, file, { upsert: false });

      if (uploadErr) { setError(uploadErr.message); continue; }

      const { data: urlData } = supabase.storage.from("business-photos").getPublicUrl(path);

      const { data: newPhoto } = await supabase
        .from("business_photos")
        .insert({ business_id: bizId, url: urlData.publicUrl, order_index: photos.length })
        .select()
        .single();

      if (newPhoto) setPhotos(prev => [...prev, newPhoto]);
    }
    setUploading(false);
  };

  const handleDeletePhoto = async (photoId: string, url: string) => {
    if (!bizId) return;
    // Estrai path dallo URL
    const path = url.split("/business-photos/")[1];
    if (path) await supabase.storage.from("business-photos").remove([path]);
    await supabase.from("business_photos").delete().eq("id", photoId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ padding: "40px 48px", maxWidth: "800px", color: "#F5F5F0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0 }}>Profilo venue</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginTop: "4px" }}>
            Queste informazioni sono visibili agli utenti di My Mood
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "11px 24px", borderRadius: "12px", border: "none",
            background: saved ? "#10B981" : "linear-gradient(135deg, #8B5CF6, #6D28D9)",
            color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(139,92,246,0.3)", transition: "background 0.3s",
          }}
        >
          {saving ? "Salvataggio…" : saved ? "✓ Salvato!" : "Salva modifiche"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: "13px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Sezione info base */}
      <Section title="Informazioni base">
        <Row>
          <Field label="Nome del locale *">
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Es. Bar Brera" />
          </Field>
          <Field label="Categoria">
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </Row>
        <Field label="Descrizione (mostrata agli utenti)">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Racconta il tuo locale: atmosfera, specialità, cosa rende unica l'esperienza…"
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </Field>
      </Section>

      {/* Sezione posizione */}
      <Section title="Posizione">
        <Row>
          <Field label="Indirizzo">
            <input value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} placeholder="Via Corsico 3, Milano" />
          </Field>
          <Field label="Quartiere">
            <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} style={inputStyle}>
              {NEIGHBORHOODS.map(n => <option key={n} value={n}>{NEIGHBORHOOD_LABELS[n]}</option>)}
            </select>
          </Field>
        </Row>
      </Section>

      {/* Sezione contatti */}
      <Section title="Contatti">
        <Row>
          <Field label="Telefono">
            <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+39 02 1234567" />
          </Field>
          <Field label="Sito web">
            <input value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} placeholder="https://www.iltuolocale.it" />
          </Field>
        </Row>
        <Field label="Instagram">
          <input value={instagram} onChange={e => setInstagram(e.target.value)} style={inputStyle} placeholder="@nomeprofilo" />
        </Field>
      </Section>

      {/* Sezione foto */}
      <Section title="Foto del locale" id="foto">
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginBottom: "16px" }}>
          Carica fino a 10 foto (max 5MB ciascuna). La prima foto è quella principale.
        </p>

        {/* Griglia foto */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
          {photos.map((photo, idx) => (
            <div key={photo.id} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "4/3" }}>
              <img src={photo.url} alt={`foto ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {idx === 0 && (
                <div style={{ position: "absolute", top: "6px", left: "6px", padding: "2px 8px", borderRadius: "6px", background: "rgba(139,92,246,0.85)", color: "white", fontSize: "10px", fontWeight: 700 }}>
                  Principale
                </div>
              )}
              <button
                onClick={() => handleDeletePhoto(photo.id, photo.url)}
                style={{
                  position: "absolute", top: "6px", right: "6px",
                  width: "26px", height: "26px", borderRadius: "50%",
                  background: "rgba(239,68,68,0.85)", border: "none",
                  color: "white", fontSize: "14px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          ))}

          {/* Bottone aggiungi */}
          {photos.length < 10 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                aspectRatio: "4/3", borderRadius: "10px",
                border: "2px dashed rgba(139,92,246,0.3)",
                background: "rgba(139,92,246,0.05)",
                color: "rgba(139,92,246,0.7)", fontSize: "13px", fontWeight: 600,
                cursor: uploading ? "default" : "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {uploading ? (
                <>
                  <div style={{ width: "20px", height: "20px", border: "2px solid rgba(139,92,246,0.3)", borderTopColor: "#8B5CF6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <span>Caricamento…</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: "24px" }}>+</span>
                  <span>Aggiungi foto</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={e => handleUploadPhoto(e.target.files)}
        />
      </Section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Helper components ─────────────────── */
function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} style={{ marginBottom: "28px" }}>
      <h2 style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>
        {title}
      </h2>
      <div style={{ background: "#0d0b16", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "8px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
  color: "#F5F5F0", fontSize: "13px", outline: "none", boxSizing: "border-box",
};
