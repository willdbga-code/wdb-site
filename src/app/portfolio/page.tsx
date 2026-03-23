"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Portfolio() {
  const [casamentos, setCasamentos] = useState<any[]>([]);
  const [ensaios, setEnsaios] = useState<any[]>([]);
  const [comerciais, setComerciais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const q = query(collection(db, "portfolio_public"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        setCasamentos(data.filter((item: any) => item.category === "casamentos"));
        setEnsaios(data.filter((item: any) => item.category === "ensaios"));
        setComerciais(data.filter((item: any) => item.category === "comerciais"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <main className="min-h-screen bg-background pb-32">
        <div className="pt-32 px-6 md:px-12 lg:px-24 mb-24 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white uppercase tracking-widest text-xs transition-colors w-fit md:hidden mb-12">
                <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            
            <div className="text-mask">
                <motion.h1 
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl md:text-9xl font-serif font-light uppercase tracking-tighter"
                >
                    Obra <br/> <span className="text-primary italic lowercase">Visual</span>
                </motion.h1>
            </div>
        </div>

        {/* Section: Casamentos */}
        <section id="casamentos" className="border-t border-border/50 pt-24 mb-32">
            <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-16">
                <span className="text-primary font-mono text-[10px] tracking-[0.3em] mb-4 block">PORTFÓLIO / 01</span>
                <h2 className="text-4xl md:text-6xl font-serif font-light mb-6">Casamentos</h2>
                <p className="text-gray-400 font-light max-w-xl">Curadoria de emoções registradas em alta costura e luz cinematográfica.</p>
            </div>

            <div className="w-full overflow-x-auto pb-8 hide-scrollbar cursor-ew-resize">
                <div className="flex gap-6 px-6 md:px-12 lg:px-24 w-max">
                    {casamentos.length === 0 && <p className="text-gray-500 text-xs uppercase tracking-widest">Nenhuma obra exposta.</p>}
                    {casamentos.map((item, i) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="relative w-[85vw] md:w-[60vw] lg:w-[40vw] aspect-[16/9] overflow-hidden group bg-surface"
                        >
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover md:grayscale-[60%] md:group-hover:grayscale-0 md:group-hover:scale-105 transition-all duration-[1.5s]" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Section: Ensaios */}
        <section id="ensaios" className="border-t border-border/50 pt-24 mb-32">
            <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-16 flex flex-col items-end text-right">
                <span className="text-primary font-mono text-[10px] tracking-[0.3em] mb-4 block">PORTFÓLIO / 02</span>
                <h2 className="text-4xl md:text-6xl font-serif font-light mb-6">Ensaios Editoriais</h2>
                <p className="text-gray-400 font-light max-w-xl">Direção estrita para projetos comerciais e portfólios pessoais de impacto.</p>
            </div>

            <div className="w-full overflow-x-auto pb-8 hide-scrollbar cursor-ew-resize">
                <div className="flex gap-6 px-6 md:px-12 lg:px-24 w-max flex-row-reverse">
                    {ensaios.length === 0 && <p className="text-gray-500 text-xs uppercase tracking-widest">Nenhuma obra exposta.</p>}
                    {ensaios.map((item, i) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="relative w-[70vw] md:w-[40vw] lg:w-[30vw] aspect-[3/4] overflow-hidden group bg-surface"
                        >
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover md:grayscale-[80%] md:group-hover:grayscale-0 md:group-hover:scale-105 transition-all duration-[1.5s]" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Section: Comerciais */}
        <section id="comercial" className="border-t border-border/50 pt-24">
            <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-16">
                <span className="text-primary font-mono text-[10px] tracking-[0.3em] mb-4 block">PORTFÓLIO / 03</span>
                <h2 className="text-4xl md:text-6xl font-serif font-light mb-6">Imagem & Rebranding</h2>
                <p className="text-gray-400 font-light max-w-xl">Traduzindo autoridade em perspectiva. Para empresas e líderes corporativos.</p>
            </div>

            <div className="w-full overflow-x-auto pb-8 hide-scrollbar cursor-ew-resize">
                <div className="flex gap-6 px-6 md:px-12 lg:px-24 w-max">
                    {comerciais.length === 0 && <p className="text-gray-500 text-xs uppercase tracking-widest">Nenhuma obra exposta.</p>}
                    {comerciais.map((item, i) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="relative w-[70vw] md:w-[40vw] lg:w-[30vw] aspect-[3/4] overflow-hidden group bg-surface"
                        >
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover md:grayscale-[80%] md:group-hover:grayscale-0 md:group-hover:scale-105 transition-all duration-[1.5s]" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    </main>
  );
}
