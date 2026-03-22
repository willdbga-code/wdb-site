"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "site_config"));
        if (snap.exists() && snap.data().heroImage) {
          setBgImage(snap.data().heroImage);
        } else {
          setBgImage("https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2500");
        }
      } catch (err) { 
        setBgImage("https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2500");
      }
    };
    fetchSettings();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yMove = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  
  const textRevealVariants = {
    hidden: { y: "150%" },
    visible: (i: number) => ({
      y: "0%",
      transition: { duration: 1.2, ease: "easeOut" as const, delay: i * 0.1 }
    })
  };

  return (
    <section ref={containerRef} className="relative h-[110vh] w-full overflow-hidden bg-background">
      {/* Background Image Parallax */}
      <motion.div 
        style={{ y: yMove, scale: scaleImage }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#030303] z-10" />
        {bgImage ? (
           <img 
             src={bgImage} 
             alt="William Del Barrio Art Photography"
             className="w-full h-full object-cover object-[center_30%] grayscale-[80%] contrast-125 animate-in fade-in duration-1000"
           />
        ) : (
           <div className="absolute inset-0 bg-black animate-pulse" />
        )}
      </motion.div>

      {/* Content wrapper */}
      <motion.div 
        style={{ opacity: yOpacity }}
        className="relative z-20 h-full flex flex-col justify-end pb-32 px-6 md:px-12 lg:px-24"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-white/20 pb-12">
            
            {/* Massive Typography Reel */}
            <div className="flex flex-col uppercase tracking-tighter leading-[0.85] text-white">
                <div className="text-mask">
                    <motion.h1 
                        custom={0} initial="hidden" animate="visible" variants={textRevealVariants}
                        className="text-[12vw] md:text-[8vw] font-serif font-light"
                    >
                        William
                    </motion.h1>
                </div>
                <div className="text-mask">
                    <motion.h1 
                        custom={1} initial="hidden" animate="visible" variants={textRevealVariants}
                        className="text-[12vw] md:text-[8vw] font-serif font-light flex items-center gap-4 md:gap-8"
                    >
                        <span className="text-primary italic lowercase font-serif text-[10vw] md:text-[7vw]">del</span> Barrio
                    </motion.h1>
                </div>
            </div>

            {/* Subtext and technological CTA */}
            <div className="max-w-sm flex flex-col items-start md:items-end text-left md:text-right">
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="text-gray-400 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 leading-relaxed"
                >
                    Matrimônios <br/> Ensaios Editoriais <br/> Imagem Comercial
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                >
                    <Link 
                        href="/portfolio" 
                        className="group flex items-center gap-4 bg-white text-black px-6 py-4 uppercase text-xs font-bold tracking-widest hover:bg-primary hover:text-white transition-all duration-500 overflow-hidden relative"
                    >
                        <span className="relative z-10">Explorar Obra</span>
                        <ArrowDownRight className="w-4 h-4 relative z-10 group-hover:rotate-[-45deg] transition-transform duration-500" />
                        <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0" />
                    </Link>
                </motion.div>
            </div>
        </div>
      </motion.div>
    </section>
  );
}
