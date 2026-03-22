"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ServicesPreview() {
  return (
    <section className="bg-background text-foreground py-32 px-6 lg:px-24 relative overflow-hidden hidden" id="services">
      {/* ... keeping display hidden if not used or rather writing the actual display ... wait, I will write the visible file */}
      {/* Decoração Tecnológica */}
      <div className="absolute top-0 right-10 w-[1px] h-full bg-border" />
      <div className="absolute top-[20%] left-0 w-full h-[1px] bg-border opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10 block">
        <div className="mb-24 md:mb-32 flex flex-col md:flex-row justify-between items-end gap-6 relative">
          <div className="text-mask">
            <motion.h2 
               initial={{ y: "100%" }}
               whileInView={{ y: "0%" }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
               className="text-6xl md:text-8xl font-serif font-light tracking-tighter uppercase"
            >
               Áreas de <br/> <span className="text-primary italic lowercase">Ação</span>
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xs font-mono text-gray-400 uppercase tracking-widest max-w-[200px]"
          >
             Onde a competência encontra a estética absoluta.
          </motion.p>
        </div>

        {/* Layout Tecnológico / Desconstruído */}
        <div className="flex flex-col gap-24 md:gap-40">
          
          {/* Card 1: Casamentos */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1 }}
               className="w-full md:w-3/5 overflow-hidden relative aspect-[16/9]"
             >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1544257134-8bba23eddf82?q=80&w=2000&auto=format&fit=crop" 
                  alt="Casamentos"
                  className="w-full h-full object-cover grayscale-[80%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
                />
             </motion.div>
             <div className="w-full md:w-2/5 flex flex-col justify-center">
                <span className="text-primary font-mono text-[10px] tracking-[0.3em] mb-4 block">01 // MATRIMÔNIO</span>
                <Link href="/portfolio#casamentos">
                    <h3 className="text-4xl md:text-5xl font-serif font-light mb-6 hover:italic transition-all">Casamentos</h3>
                </Link>
                <p className="text-gray-400 font-light mb-8">A intersecção entre o glamour da alta costura e a emoção crua de um dos dias mais marcantes da vida humana.</p>
                <Link href="/services/casamentos" className="flex items-center gap-4 text-[10px] tracking-widest uppercase pb-2 border-b border-white/20 w-fit hover:border-primary hover:text-primary transition-all group-hover:translate-x-4 duration-500">
                  Explorar Pacote <ArrowRight className="w-4 h-4" />
                </Link>
             </div>
          </div>

          {/* Card 2: Ensaios Editoriais */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 group">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1 }}
               className="w-full md:w-3/5 overflow-hidden relative aspect-[4/5] md:aspect-[3/4] max-w-lg"
             >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6ece?q=80&w=2000&auto=format&fit=crop" 
                  alt="Ensaios Editoriais"
                  className="w-full h-full object-cover grayscale-[80%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
                />
             </motion.div>
             <div className="w-full md:w-2/5 flex flex-col justify-center items-start md:items-end text-left md:text-right">
                <span className="text-primary font-mono text-[10px] tracking-[0.3em] mb-4 block">02 // ARTE VISUAL</span>
                <Link href="/portfolio#ensaios">
                    <h3 className="text-4xl md:text-5xl font-serif font-light mb-6 hover:italic transition-all">Ensaios Editoriais</h3>
                </Link>
                <p className="text-gray-400 font-light mb-8">Direção de arte estrita e luz pintada à mão. Para marcas e indivíduos que buscam imortalizar uma estética única.</p>
                <Link href="/services/ensaios" className="flex items-center gap-4 text-[10px] tracking-widest uppercase pb-2 border-b border-white/20 w-fit hover:border-primary hover:text-primary transition-all group-hover:-translate-x-4 duration-500">
                  Explorar Pacote <ArrowRight className="w-4 h-4" />
                </Link>
             </div>
          </div>

          {/* Card 3: Imagem e Rebranding */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1 }}
               className="w-full md:w-2/5 overflow-hidden relative aspect-square"
             >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop" 
                  alt="Consultoria de Imagem"
                  className="w-full h-full object-cover grayscale-[80%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
                />
             </motion.div>
             <div className="w-full md:w-3/5 flex flex-col justify-center">
                <span className="text-primary font-mono text-[10px] tracking-[0.3em] mb-4 block">03 // MARCA PESSOAL</span>
                <Link href="/portfolio#comercial">
                    <h3 className="text-4xl md:text-5xl font-serif font-light mb-6 hover:italic transition-all">Ensaios Comerciais & Rebranding</h3>
                </Link>
                <p className="text-gray-400 font-light mb-8 max-w-xl">Removemos o ruído digital e alinhamos a sua imagem com a autoridade que sua competência já exige. O foco absoluto em comunicar credibilidade através de retratos de altíssimo padrão.</p>
                <Link href="/services/comerciais" className="flex items-center gap-4 text-[10px] tracking-widest uppercase pb-2 border-b border-white/20 w-fit hover:border-primary hover:text-primary transition-all group-hover:translate-x-4 duration-500">
                  Consultoria de Imagem <ArrowRight className="w-4 h-4" />
                </Link>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
