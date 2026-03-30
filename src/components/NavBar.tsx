"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Esconder ao rolar para baixo (se já tiver rolado um pouco), mostrar ao subir
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Se o menu abrir, força a barra aparecer
  useEffect(() => {
    if (isOpen) setIsVisible(true);
  }, [isOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 w-full p-6 md:px-12 lg:px-24 z-[90] flex justify-between items-center mix-blend-difference text-white pointer-events-none transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <Link href="/" className="font-serif tracking-widest uppercase hover:text-primary transition-colors pointer-events-auto relative z-[100]" onClick={() => setIsOpen(false)}>
           W <span className="text-primary italic lowercase">d</span> B
        </Link>
        
        <nav className="hidden md:flex gap-12 text-xs uppercase tracking-[0.2em] font-mono pointer-events-auto">
           <Link href="/portfolio" className="hover:text-primary transition-colors">Galeria</Link>
           <Link href="/about" className="hover:text-primary transition-colors">Filosofia</Link>
           <Link href="/login" className="text-primary border-b border-primary/30 hover:border-primary transition-colors pb-1">
             Área do Cliente
           </Link>
        </nav>
        
        {/* Mobile Toggle Button */}
        <button 
           className="md:hidden pointer-events-auto relative z-[100] hover:text-primary transition-colors"
           onClick={() => setIsOpen(!isOpen)}
        >
           {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Animated Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#080808] z-[85] flex flex-col items-center justify-center pointer-events-auto"
          >
             <nav className="flex flex-col items-center gap-10 text-center text-white">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }} transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}>
                   <Link href="/portfolio" onClick={() => setIsOpen(false)} className="block py-4 px-8 text-sm md:text-xs font-mono uppercase tracking-[0.2em] hover:text-primary transition-colors">
                     Galeria
                   </Link>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }} transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}>
                   <Link href="/about" onClick={() => setIsOpen(false)} className="block py-4 px-8 text-sm md:text-xs font-mono uppercase tracking-[0.2em] hover:text-primary transition-colors">
                     Filosofia
                   </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }} transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }} className="mt-8">
                   <Link href="/login" onClick={() => setIsOpen(false)} className="block py-4 px-8 text-sm md:text-xs font-mono uppercase tracking-[0.2em] text-primary border-b border-primary/50 pb-2 hover:border-primary transition-colors">
                     Área do Cliente
                   </Link>
                </motion.div>
             </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
