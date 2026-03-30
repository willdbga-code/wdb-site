"use client";

import { useState, useEffect } from "react";
import { Users, Folders, DollarSign, Loader2, MessageSquare } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminHome() {
  const [stats, setStats] = useState({ clients: 0, photos: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "client")));
        const photosSnap = await getDocs(collection(db, "photos"));
        const msgsSnap = await getDocs(collection(db, "messages"));
        
        setStats({
          clients: usersSnap.size,
          photos: photosSnap.size,
          messages: msgsSnap.size
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 md:p-16">
      <h1 className="text-4xl font-serif text-white mb-2">Visão Geral</h1>
      <p className="text-gray-400 font-light mb-12 text-sm tracking-wide">Bem-vindo de volta ao seu Império, William.</p>
      
      {loading ? (
        <div className="flex py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="p-6 bg-surface border border-border flex flex-col justify-between">
              <div>
                 <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Folders className="w-4 h-4"/> Fotos em Nuvem</h3>
                 <p className="text-4xl font-serif text-white mb-4">{stats.photos}</p>
              </div>
              <a href="/admin/storage" className="text-xs uppercase tracking-widest text-primary hover:text-white transition-colors">
                 Gerenciar Armazenamento &rarr;
              </a>
           </div>
           <div className="p-6 bg-surface border border-border">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Users className="w-4 h-4"/> Clientes Cadastrados</h3>
              <p className="text-4xl font-serif text-white">{stats.clients}</p>
           </div>
           <div className="p-6 bg-surface border border-border">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Histórico de Mensagens</h3>
              <p className="text-4xl font-serif text-white">{stats.messages}</p>
           </div>
        </div>
      )}

      <h2 className="text-xl font-serif text-white mb-6">Nota Importante</h2>
      <div className="bg-surface border border-border p-6 opacity-75">
         <p className="text-sm text-gray-400 font-light">
           O seu novo painel foi conectado com sucesso ao Firebase. Os contadores acima já processam as métricas em tempo real direto do Google Cloud. 
           Explore o menu lateral para utilizar o CRM de clientes e o novo Chat.
         </p>
      </div>
    </div>
  );
}
