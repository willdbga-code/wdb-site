"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import LeadBotPopup from "@/components/LeadBotPopup";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCampaignPage = pathname.startsWith("/c/");

  return (
    <>
      {!isCampaignPage && <NavBar />}
      {children}
      {!isCampaignPage && <LeadBotPopup />}
    </>
  );
}
