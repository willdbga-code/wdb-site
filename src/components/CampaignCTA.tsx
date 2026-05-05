"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CampaignCTAProps {
  href: string;
  text: string;
  slug: string;
}

export default function CampaignCTA({ href, text, slug }: CampaignCTAProps) {
  return (
    <Link 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full group flex items-center justify-center gap-3 bg-primary text-black px-8 py-5 uppercase text-xs font-bold tracking-widest hover:bg-white transition-all shadow-[0_0_40px_rgba(205,164,52,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
      onClick={() => {
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq('track', 'Lead', { content_name: slug });
        }
      }}
    >
      {text}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
