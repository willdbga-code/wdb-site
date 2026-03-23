"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function About() {
  const [images, setImages] = useState({
    about: "",
    signature: ""
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "site_config"));
        if (snap.exists()) {
          const data = snap.data();
          setImages({
            about: data.aboutImage || images.about,
            signature: data.signatureIcon || images.signature
          });
        }
      } catch (err) {}
    }
    fetchSettings();
  }, []);

  return (
    <section id="about" className="bg-background text-foreground py-32 px-6 md:px-12 lg:px-24 border-t border-border/30 relative">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center gap-16 md:gap-24 relative z-10">
        
        {/* Imagem Editorial */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full xl:w-1/2"
        >
          <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden ring-1 ring-white/10 group">
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10 duration-[2s]" />
            {images.about ? (
               <img 
                 src={images.about} 
                 alt="William Del Barrio trabalhando"
                 className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-[2s] animate-in fade-in duration-1000"
               />
            ) : (
               <div className="w-full h-full bg-surface animate-pulse" />
            )}
          </div>
        </motion.div>

        {/* Texto Editorial baseando-se no Copy Real */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="w-full xl:w-1/2 flex flex-col justify-center"
        >
          <h2 className="text-xs tracking-[0.4em] uppercase text-primary mb-6 font-mono">
            Consultoria de Imagem e Marca
          </h2>
          <h3 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-serif font-light mb-8 leading-tight">
            A Estética da <br/><span className="italic">Competência</span>.
          </h3>
          <div className="space-y-6 text-gray-400 font-light leading-relaxed text-base md:text-lg text-justify max-w-2xl">
            <p className="text-white text-xl font-serif italic mb-8">
              "Tudo o que ouvimos é uma opinião, não um fato. Tudo o que vemos é uma perspectiva, não a verdade."
            </p>
            <p>
              Sou William Del Barrio, fotógrafo há 4 anos e estudante de Fotografia pela Universidade Cruzeiro do Sul. Minha paixão primordial reside nos limites do impalpável — a fotografia conceitual e comercial, onde o imperfeccionismo encontra a precisão estética através da minha especialidade em manipulação de imagem fina e Photoshop.
            </p>
            <p>
              O verdadeiro profissionalismo não grita. Ele se estabelece. 
              A sua competência técnica pode ser inquestionável no mundo físico, mas a internet é um ambiente impiedosamente visual. 
            </p>
            <p>
              Com uma base sólida no essencialismo, meu ofício não é criar um personagem para você. É remover o ruído digital e colocar um holofote na sua essência mais potente. Acredito visceralmente que <strong className="text-white font-normal">uma marca forte constitui um império forte</strong>.
            </p>
            <p>
              Através de uma direção de arte minuciosa e da luz estratégica do Chiaroscuro, capturamos a sua versão de maior integridade, traduzindo sua inteligência em imagem e autoridade inquestionável.
            </p>
          </div>
          
          <div className="mt-16">
            <p className="text-xs text-primary uppercase tracking-[0.2em] font-mono mb-6">Assinatura</p>
            {images.signature ? (
               <img src={images.signature} alt="Assinatura" className="h-12 invert opacity-70 animate-in fade-in" />
            ) : (
               <div className="h-12 w-32 bg-surface animate-pulse" />
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
