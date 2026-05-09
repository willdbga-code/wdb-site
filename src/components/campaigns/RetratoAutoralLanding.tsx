"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Sparkles, Eye, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import type { Campaign } from "@/lib/campaigns";

interface Props {
  campaign: Campaign;
  wppLink: string;
}

/* ── image arrays ── */
const galleryImages = [
  "/images/campaigns/retrato-autoral/gallery/bealustosa-20260506-0001.jpg",
  "/images/campaigns/retrato-autoral/gallery/william.delbarrio-20260506-0014.jpg",
  "/images/campaigns/retrato-autoral/gallery/bealustosa-20260506-0002.jpg",
  "/images/campaigns/retrato-autoral/gallery/naomi_domoto-20260506-0001.jpg",
  "/images/campaigns/retrato-autoral/gallery/william.delbarrio-20260506-0001.jpg",
  "/images/campaigns/retrato-autoral/gallery/bealustosa-20260506-0003.jpg",
  "/images/campaigns/retrato-autoral/gallery/william.delbarrio-20260506-0008.jpg",
  "/images/campaigns/retrato-autoral/gallery/natani.vtn-20260506-0001.jpg",
  "/images/campaigns/retrato-autoral/gallery/bealustosa-20260506-0004.jpg",
  "/images/campaigns/retrato-autoral/gallery/naomi_domoto-20260506-0002.jpg",
  "/images/campaigns/retrato-autoral/gallery/william.delbarrio-20260506-0002.jpg",
  "/images/campaigns/retrato-autoral/gallery/william.delbarrio-20260506-0003.jpg",
];

const proofImages = [
  "/images/campaigns/retrato-autoral/proofs/Screenshot_20260506_172607_WhatsAppBusiness.png",
  "/images/campaigns/retrato-autoral/proofs/Screenshot_20260506_172701_WhatsAppBusiness.png",
  "/images/campaigns/retrato-autoral/proofs/Screenshot_20260506_172905_WhatsAppBusiness.png",
  "/images/campaigns/retrato-autoral/proofs/Screenshot_20260506_172925_WhatsAppBusiness.png",
  "/images/campaigns/retrato-autoral/proofs/Screenshot_20260506_173025_WhatsAppBusiness.png",
  "/images/campaigns/retrato-autoral/proofs/Screenshot_20260506_173034_WhatsAppBusiness.png",
];

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── CTA Button ── */
function CTAButton({ href, text, slug }: { href: string; text: string; slug: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center justify-center gap-3 bg-primary text-black px-10 py-5 uppercase text-xs font-bold tracking-[0.2em] overflow-hidden transition-all duration-500 hover:shadow-[0_0_60px_rgba(205,164,52,0.5)]"
      onClick={() => {
        if (typeof window !== "undefined" && (window as any).fbq) {
          (window as any).fbq("track", "Lead", { content_name: slug });
        }
      }}
    >
      <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
      <span className="relative z-10 group-hover:text-black transition-colors duration-300">{text}</span>
      <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
    </Link>
  );
}

/* ── Social Proof Carousel ── */
function ProofCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 backdrop-blur-sm border border-white/10 p-3 hover:bg-primary/20 transition-colors -translate-x-1/2 hidden md:flex items-center justify-center" aria-label="Anterior">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 backdrop-blur-sm border border-white/10 p-3 hover:bg-primary/20 transition-colors translate-x-1/2 hidden md:flex items-center justify-center" aria-label="Próximo">
        <ChevronRight className="w-5 h-5" />
      </button>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4" style={{ scrollbarWidth: "none" }}>
        {proofImages.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex-shrink-0 snap-center w-[280px] md:w-[300px] rounded-lg overflow-hidden border border-white/10 shadow-2xl hover:border-primary/30 transition-colors duration-300"
          >
            <Image src={src} alt={`Depoimento ${i + 1}`} width={300} height={600} className="w-full h-auto object-cover" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN LANDING PAGE
   ══════════════════════════════════════════════ */
export default function RetratoAutoralLanding({ campaign, wppLink }: Props) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  return (
    <>
      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[9998] bg-black/95 flex items-center justify-center p-4 cursor-pointer" onClick={() => setLightboxImg(null)}>
          <Image src={lightboxImg} alt="Foto ampliada" width={1200} height={1600} className="max-h-[90vh] w-auto object-contain" />
        </div>
      )}

      <main className="min-h-screen bg-background overflow-hidden">

        {/* ═══════════════════════════════════════
            SECTION 1 — HERO
            ═══════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background — the stunning snake portrait */}
          <div className="absolute inset-0">
            <Image
              src="/images/campaigns/retrato-autoral/gallery/bealustosa-20260506-0001.jpg"
              alt="Retrato Autoral — WDB Editorial"
              fill
              className="object-cover object-top"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="text-primary font-mono text-[10px] md:text-xs uppercase block mb-8"
            >
              W d B — Editorial Photography
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
              className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-serif font-light leading-[0.9] tracking-tight mb-8"
            >
              Retrato<br />
              <span className="italic text-primary">Autoral</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-12"
            >
              A sua essência, traduzida em imagem.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              <CTAButton href={wppLink} text="Quero Ser Retratado" slug={campaign.slug} />
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Descubra</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-[1px] h-8 bg-gradient-to-b from-primary to-transparent"
              />
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 2 — THE MANIFESTO / PROBLEM
            ═══════════════════════════════════════ */}
        <section className="py-28 md:py-40 px-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />

          <div className="max-w-4xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase mb-10"
            >
              Uma reflexão necessária
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="text-3xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-10"
            >
              Você tem uma foto que te<br />
              <span className="italic text-primary">representa de verdade?</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="space-y-6 text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-3xl mx-auto"
            >
              <p>
                Existe uma diferença entre ser <strong className="text-foreground font-normal">fotografado</strong> e ser{" "}
                <strong className="text-primary font-normal">retratado</strong>.
              </p>
              <p>
                Ser fotografado é registrar um momento. Ser retratado é capturar quem você é — a sua essência, o seu olhar, a sua história.
              </p>
              <p>
                Um retrato autoral não é apenas uma imagem bonita. É a <strong className="text-foreground font-normal">tradução visual da sua identidade</strong> — feita com direção de arte, luz cinematográfica e um olhar que enxerga além do superficial.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 3 — GALLERY GRID
            ═══════════════════════════════════════ */}
        <section className="py-20 md:py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase block mb-4">Portfólio</span>
              <h2 className="text-4xl md:text-6xl font-serif font-light">
                Resultados <span className="italic text-primary">Reais</span>
              </h2>
            </motion.div>

            {/* Masonry-like grid */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="columns-2 md:columns-3 gap-3 md:gap-4 space-y-3 md:space-y-4"
            >
              {galleryImages.map((src, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="break-inside-avoid overflow-hidden group cursor-pointer relative"
                  onClick={() => setLightboxImg(src)}
                >
                  <div className="overflow-hidden">
                    <Image
                      src={src}
                      alt={`Retrato autoral ${i + 1}`}
                      width={600}
                      height={800}
                      className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                    <Eye className="w-5 h-5 text-white/80" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 4 — HOW IT WORKS
            ═══════════════════════════════════════ */}
        <section className="py-28 md:py-36 px-6 relative bg-surface/50">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-20">
              <span className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase block mb-4">A Experiência</span>
              <h2 className="text-4xl md:text-6xl font-serif font-light">
                Como <span className="italic text-primary">Funciona</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
              {[
                { icon: <Sparkles className="w-6 h-6" />, step: "01", title: "Direção de Arte", desc: "Planejamos juntos o conceito, paleta e mood do ensaio. Cada detalhe é pensado para traduzir quem você é." },
                { icon: <Camera className="w-6 h-6" />, step: "02", title: "Sessão com Luz Cinematográfica", desc: "Direção de expressão, movimento e poses com iluminação profissional que esculpe cada ângulo do seu rosto." },
                { icon: <Star className="w-6 h-6" />, step: "03", title: "Entrega de Alto Padrão", desc: "Fotos tratadas em alta resolução com acabamento de revista. Cores, pele e luz finalizados à mão." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.2 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 border border-primary/30 mb-6 text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500">
                    {item.icon}
                  </div>
                  <p className="text-primary font-mono text-[10px] tracking-[0.3em] mb-3">{item.step}</p>
                  <h3 className="text-xl font-serif font-light mb-4">{item.title}</h3>
                  <p className="text-gray-400 font-light text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 5 — SOCIAL PROOF
            ═══════════════════════════════════════ */}
        <section className="py-28 md:py-36 px-6 relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase block mb-4">Depoimentos Reais</span>
              <h2 className="text-4xl md:text-6xl font-serif font-light mb-4">
                O que dizem <span className="italic text-primary">nossos clientes</span>
              </h2>
              <p className="text-gray-500 text-sm font-light max-w-xl mx-auto">Reações reais de clientes ao receberem suas fotos. Sem filtros, sem edição.</p>
            </motion.div>

            <ProofCarousel />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 6 — OFFER / PRICING
            ═══════════════════════════════════════ */}
        <section className="py-28 md:py-36 px-6 relative bg-surface/50">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase block mb-4">O Pacote</span>
              <h2 className="text-4xl md:text-6xl font-serif font-light">
                O que está <span className="italic text-primary">incluso</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-background/80 backdrop-blur-md border border-border p-8 md:p-14 relative overflow-hidden"
            >
              {/* Gold corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div>
                  <ul className="space-y-5">
                    {campaign.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-4 text-gray-300"
                      >
                        <div className="w-6 h-6 border border-primary/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-primary" />
                        </div>
                        <span className="font-light">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-border pt-8 md:pt-0 md:pl-12">
                  <p className="text-xs text-gray-500 uppercase tracking-[0.3em] mb-3">Investimento</p>
                  <p className="text-5xl md:text-6xl font-serif text-white mb-2">{campaign.price}</p>
                  <p className="text-xs text-gray-500 mb-10 font-light">Condições especiais para a primeira edição</p>

                  <CTAButton href={wppLink} text={campaign.ctaText} slug={campaign.slug} />

                  <p className="text-[10px] text-gray-600 mt-6 max-w-[280px] font-light leading-relaxed">
                    Ao clicar, você será redirecionado para o nosso WhatsApp de atendimento exclusivo.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 7 — FINAL CTA
            ═══════════════════════════════════════ */}
        <section className="relative py-32 md:py-48 px-6 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/campaigns/retrato-autoral/gallery/william.delbarrio-20260506-0014.jpg"
              alt="Retrato Autoral CTA"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
          </div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-light leading-tight mb-8"
            >
              Pronto para ser<br />
              <span className="italic text-primary">retratado?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-gray-400 text-lg font-light mb-12 max-w-xl mx-auto"
            >
              Vagas limitadas por mês para garantir atenção total a cada projeto. Reserve a sua agora.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <CTAButton href={wppLink} text="Quero Ser Retratado" slug={campaign.slug} />
            </motion.div>
          </div>
        </section>

        {/* ── Footer Mini ── */}
        <footer className="py-8 border-t border-border text-center">
          <p className="text-[10px] text-gray-600 tracking-[0.2em] uppercase">
            © {new Date().getFullYear()} William del Barrio — Editorial Photography
          </p>
        </footer>
      </main>
    </>
  );
}
