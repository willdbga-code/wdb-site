"use client";

import { useAuth } from "@/lib/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function MagicUnlock() {
  const { user, loading } = useAuth();
  const [success, setSuccess] = useState(false);

  if (loading) return <div className="text-white p-16">Verificando...</div>;
  
  if (!user) return <div className="text-white p-16">Você não está logado! Volte em /login e entre primeiro.</div>;

  return (
    <div className="min-h-screen bg-black p-16 flex flex-col items-center justify-center border-t-8 border-primary">
      <h1 className="text-3xl font-serif text-white mb-2">Ferramenta Mágica</h1>
      <p className="text-gray-400 mb-12">Clique no botão abaixo para forçar o banco de dados a te reconhecer como Administrador.</p>

      {success ? (
         <div className="flex flex-col items-center gap-6">
            <CheckCircle2 className="w-16 h-16 text-primary" />
            <p className="text-white uppercase tracking-widest text-xs">Poderes concedidos!</p>
            <button 
               onClick={() => window.location.href = "/admin"}
               className="bg-white text-black px-8 py-4 font-bold text-xs tracking-widest uppercase hover:bg-primary hover:text-white transition-colors mt-4"
            >
               Entrar no Painel Admin
            </button>
         </div>
      ) : (
         <button 
            className="bg-primary text-black px-12 py-5 font-bold text-sm tracking-widest uppercase hover:bg-white transition-colors"
            onClick={async () => {
               try {
                 await setDoc(doc(db, "users", user.uid), { role: "admin" }, { merge: true });
                 setSuccess(true);
               } catch (e) {
                 alert("Erro ao atualizar!");
                 console.error(e);
               }
            }}
         >
            Me tornar Administrador
         </button>
      )}
    </div>
  )
}
