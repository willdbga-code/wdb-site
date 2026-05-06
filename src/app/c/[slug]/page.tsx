import { notFound } from "next/navigation";
import { getCampaignBySlug, campaigns } from "@/lib/campaigns";
import RetratoAutoralLanding from "@/components/campaigns/RetratoAutoralLanding";
import GenericCampaignLanding from "@/components/campaigns/GenericCampaignLanding";

interface CampaignPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return campaigns.map((campaign) => ({
    slug: campaign.slug,
  }));
}

export async function generateMetadata({ params }: CampaignPageProps) {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);

  if (!campaign) {
    return { title: "Campanha não encontrada" };
  }

  return {
    title: `${campaign.title} | William del Barrio`,
    description: campaign.description,
    openGraph: {
      title: `${campaign.title} | WDB Editorial`,
      description: campaign.description,
      images: [campaign.image],
    },
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const wppNumber = "5512988130316";
  const wppLink = `https://wa.me/${wppNumber}?text=${encodeURIComponent(campaign.whatsappMessage)}`;

  if (slug === "retrato-autoral") {
    return <RetratoAutoralLanding campaign={campaign} wppLink={wppLink} />;
  }

  return <GenericCampaignLanding campaign={campaign} wppLink={wppLink} />;
}
