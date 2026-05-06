"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import CampaignCTA from "@/components/CampaignCTA";
import type { Campaign } from "@/lib/campaigns";

interface Props {
  campaign: Campaign;
  wppLink: string;
}

export default function GenericCampaignLanding({ campaign, wppLink }: Props) {
  return (
    <main className="min-h-screen bg-background relative flex flex-col pt-10">
      <div className="absolute inset-0 z-0">
        <Image
          src={campaign.image}
          alt={campaign.title}
          fill
          className="object-cover opacity-30 grayscale mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center flex-grow justify-center">
        <div className="text-center max-w-3xl mb-16">
          <span className="text-primary font-mono text-xs tracking-[0.3em] uppercase mb-6 block">
            {campaign.subtitle}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-light mb-8 leading-tight">
            {campaign.title}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
            {campaign.description}
          </p>
        </div>

        <div className="w-full max-w-4xl bg-surface/80 backdrop-blur-md border border-border p-8 md:p-12 rounded-sm shadow-2xl mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-serif text-white mb-6 uppercase tracking-wider">O que está incluso:</h3>
              <ul className="space-y-4">
                {campaign.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-light">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col justify-center items-start md:items-end text-left md:text-right border-t md:border-t-0 md:border-l border-border pt-8 md:pt-0 md:pl-12">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Investimento</p>
              <p className="text-4xl font-serif text-white mb-8">{campaign.price}</p>
              <CampaignCTA href={wppLink} text={campaign.ctaText} slug={campaign.slug} />
              <p className="text-xs text-gray-500 mt-4 max-w-[250px] font-light">
                Ao clicar, você será redirecionado para o nosso WhatsApp de atendimento exclusivo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
