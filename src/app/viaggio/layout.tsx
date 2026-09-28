import type { ReactNode } from "react";

// Il font serif (Fraunces) usato nei titoli delle schermate Elly e' ora
// caricato globalmente da src/app/layout.tsx (serve anche allo splash screen),
// quindi questo layout si limita a passare i figli.
export default function ViaggioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
