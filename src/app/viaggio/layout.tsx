import type { ReactNode } from "react";

// Layout dedicato alla rotta /viaggio: carica il font serif (Fraunces) usato nei
// titoli delle nuove schermate Elly, senza toccare il layout principale
// (usato ancora dalle schermate serata /genera con il tema scuro).
export default function ViaggioLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
