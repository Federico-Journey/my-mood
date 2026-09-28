import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "Elly — Pianifica il tuo viaggio",
  description:
    "Elly aiuta i gruppi di amici o familiari a decidere insieme dove andare e genera itinerari di viaggio su misura in base a destinazione, durata e mood.",
  keywords: ["viaggio", "itinerario", "vacanza", "gruppo", "mood", "pianificazione"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Elly",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#7A3348",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Figtree:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <PwaRegister />
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
