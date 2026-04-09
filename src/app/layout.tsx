import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "my mood — Stop scrolling, start living",
  description:
    "Il concierge digitale per le tue serate a Milano. Scegli il tuo mood, ricevi un piano serata completo, condividilo con gli amici.",
  keywords: ["milano", "serate", "mood", "uscire", "aperitivo", "ristoranti"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
