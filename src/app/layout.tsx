import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CustomCursor from "../components/CustomCursor";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/lib/AuthContext";
import LeadBotPopup from "@/components/LeadBotPopup";
import ContentProtection from "@/components/ContentProtection";
import Analytics from "@/components/Analytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "W d B | Editorial",
  description: "William del Barrio Editorial Photography",
  openGraph: {
    title: "W d B | Editorial Photography",
    description: "Competência técnica e estética absoluta. Fotografia de alto padrão para casamentos, retratos e campanhas.",
    url: "https://williamdelbarrio.com",
    siteName: "WDB Editorial",
    images: [
      {
        url: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6ece?q=80&w=2000&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "William del Barrio Editorial",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary selection:text-black">
        <Analytics />
        <div className="bg-noise" />
        <ContentProtection />
        <CustomCursor />
        <AuthProvider>
          <NavBar />
          {children}
          <LeadBotPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
