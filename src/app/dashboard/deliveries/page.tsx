"use client";

import { useState, useEffect } from "react";
import { Package, Download, ExternalLink, Loader2 } from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardDeliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchDeliveries = async () => {
      try {
        const q = query(
          collection(db, "deliveries"), 
          where("clientId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Ordenação local para evitar obrigatoriedade de Composite Index no Firebase
        docs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDeliveries(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeliveries();
  }, [user]);

  if (loading) return <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-8 md:p-16 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
         <Package className="w-8 h-8 text-primary" />
         <h1 className="text-4xl font-serif text-white">Minhas Entregas</h1>
      </div>
      <p className="text-gray-400 font-light mb-12 text-sm tracking-wide">Acesse aqui todos os arquivos finais concluídos e liberados para você.</p>
      
      {deliveries.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border flex flex-col items-center">
            <Package className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-white font-serif text-xl mb-1">Nenhum pacote entregue</h3>
            <p className="text-gray-500 text-xs tracking-widest uppercase">Suas fotos finais aparecerão aqui quando estiverem prontas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {deliveries.map(d => (
              <div key={d.id} className="border border-border bg-surface p-8 relative group overflow-hidden transition-all hover:border-primary">
                 <div className="absolute top-0 left-0 w-1 h-full bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                 
                 <div className="flex items-start justify-between mb-6">
                    <div>
                       <span className="text-primary text-[10px] uppercase tracking-widest font-bold block mb-2">Novo</span>
                       <h3 className="text-2xl font-serif text-white line-clamp-2">{d.title}</h3>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{new Date(d.createdAt).toLocaleDateString()}</span>
                 </div>
                 
                 {d.description && (
                    <p className="text-gray-400 text-sm font-light mb-8 leading-relaxed line-clamp-3">
                       {d.description}
                    </p>
                 )}
                 
                 <a 
                    href={d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between items-center w-full bg-primary text-black font-bold uppercase tracking-widest text-xs px-6 py-4 hover:bg-white transition-colors mt-auto"
                 >
                    Acessar Pasta Externa <ExternalLink className="w-4 h-4 ml-2" />
                 </a>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
