import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopAlertBanner from "@/components/public/TopAlertBanner";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";
import VisitTracker from "@/components/public/VisitTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

//Configuration de l'affichage sur mobile (PWA)
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Ajout du manifest et des icônes Apple
export const metadata: Metadata = {
  title: "ASSTSF - Formation Secourisme et Sauvetage | La Seyne, Six-Fours, Toulon, Var (83)",
  description: "Passez vos diplômes de secourisme (PSE1, PSE2) et de sauvetage aquatique (BNSSA, SSA) avec l'Association des Secouristes de la Seyne Tamaris Six-Fours (FFSS).",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ASSTSF",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 🟢 Récupération dynamique des liens de la Navbar depuis la BDD
  let navCategories: { name: string, href: string }[] = [];
  try {
    const contents = await prisma.siteContent.findMany({
      where: { key: { startsWith: 'nav_form_' } }
    });
    const getVal = (k: string, def: string) => contents.find(c => c.key === k)?.value || def;

    navCategories = [
      { name: getVal('nav_form_1_name', 'Secourisme (GQS, PSC, PSE1, PSE2)'), href: getVal('nav_form_1_href', '/formations#secourisme') },
      { name: getVal('nav_form_2_name', 'Sauvetage Aquatique (BNSSA, SSA Littoral option PES)'), href: getVal('nav_form_2_href', '/formations#aquatique') },
      { name: getVal('nav_form_3_name', 'Recyclages'), href: getVal('nav_form_3_href', '/formations#recyclages') },
    ].filter(c => c.name.trim() !== "");
  } catch (e) {
    console.error("Erreur lors de la récupération des menus:", e);
  }

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <VisitTracker />
          <TopAlertBanner />
          <Navbar navCategories={navCategories} />
          <main className="flex-grow">{children}</main>
          <Footer />
          {/* Le Toaster doit être à l'intérieur de Providers pour éviter les soucis de contexte */}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}