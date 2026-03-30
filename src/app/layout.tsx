import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CustomCursor from "../components/CustomCursor";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/lib/AuthContext";
import LeadBotPopup from "@/components/LeadBotPopup";

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
        <div className="bg-noise" />
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
