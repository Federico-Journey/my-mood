import type { ReactNode } from "react";

// I font di Elly (Outfit per i titoli, Figtree per i testi) sono caricati
// globalmente da src/app/layout.tsx, quindi questo layout si limita a
// passare i figli.
export default function ViaggioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
