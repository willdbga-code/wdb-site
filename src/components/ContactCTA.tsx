"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ContactCTA() {
  return (
    <section className="bg-surface py-32 px-6 md:px-12 lg:px-24 border-t border-border relative overflow-hidden flex flex-col items-center text-center">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 max-w-2xl flex flex-col items-center"
      >
        <MessageSquare className="w-12 h-12 text-primary mb-8 opacity-80" />
        
        <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
          Sua imagem merece <br/><span className="italic font-light">Eternidade.</span>
        </h2>
        
        <p className="text-gray-400 font-light leading-relaxed mb-12 text-lg">
          Do comercial à cerimônia perfeita, vamos juntos construir fotografias impecáveis.
          Agende a sua sessão e obtenha um orçamento personalizado diretamente comigo.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
           <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-lead-bot'))}
              className="group flex items-center justify-center gap-3 bg-primary text-black px-8 py-5 uppercase text-xs font-bold tracking-widest hover:bg-white transition-all w-full sm:w-auto"
           >
              Solicitar Orçamento
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
           
           <Link 
              href="/register" 
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors underline underline-offset-8 decoration-border hover:decoration-white"
           >
              Já sou Cliente
           </Link>
        </div>
      </motion.div>
    </section>
  );
}
