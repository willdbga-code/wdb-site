"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ClientChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Puxa todas as mensagens ordenadas por tempo e filtra em memória 
    // (para evitar erro de Index Composto no Firestore de teste)
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setMessages(allMsgs.filter(m => m.userId === user.uid));
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msgText = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      await addDoc(collection(db, "messages"), {
        userId: user.uid,
        userName: user.fullName || "Cliente",
        text: msgText,
        sender: "client",
        timestamp: new Date().toISOString()
      });

      // Simple Auto-Reply Bot logic (Runs once per session to avoid spam)
      if (!sessionStorage.getItem("hasAutoReplied")) {
         sessionStorage.setItem("hasAutoReplied", "true");
         setTimeout(async () => {
             await addDoc(collection(db, "messages"), {
               userId: user.uid,
               userName: user.fullName || "Cliente",
               text: "Olá! No momento o William está fotografando ou em sessão de edição. 📸 Pode deixar sua mensagem detalhada aqui que ele lerá e responderá o mais breve possível!",
               sender: "admin",
               timestamp: new Date().toISOString()
             });
         }, 3000);
      }

    } catch (err) {
      console.error("Erro ao enviar mensagem", err);
      setNewMessage(msgText); // Revert on error
    }
  };

  return (
    <div className="p-8 md:p-16 h-full flex flex-col">
      <div className="mb-8">
         <h1 className="text-4xl font-serif text-white mb-2">Atendimento</h1>
         <p className="text-gray-400 font-light text-sm tracking-wide">Fale diretamente com o William para alinhar detalhes e correções das fotos.</p>
      </div>

      <div className="flex-1 border border-border bg-surface/30 flex flex-col max-w-4xl max-h-[60vh]">
         {/* Histórico */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-xs tracking-widest uppercase text-gray-500 my-10 border border-border border-dashed py-8">
                 Nenhuma mensagem. Inicie a conversa abaixo.
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`${msg.sender === 'client' ? 'bg-surface border-border' : 'bg-[#111] border-primary/30'} border p-4 max-w-[70%] flex gap-4`}>
                    {msg.sender !== 'client' && (
                      <div className="w-8 h-8 rounded-full bg-black shrink-0 border border-primary/20 flex justify-center items-center text-primary font-serif">W</div>
                    )}
                    <div>
                      <p className="text-gray-200 text-sm font-light">{msg.text}</p>
                      <span className="text-[10px] text-gray-500 mt-2 block uppercase tracking-widest">
                        {msg.sender === 'client' ? 'Você' : 'William Del Barrio'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                 </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
         </div>

         {/* Input */}
         <div className="p-4 bg-surface/50 border-t border-border">
            <form onSubmit={handleSend} className="flex gap-4">
               <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  className="w-full bg-transparent text-white outline-none border-b border-white/10 focus:border-white transition-colors"
               />
               <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-white text-black px-6 py-3 uppercase tracking-widest text-xs font-medium hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
               >
                  Enviar
               </button>
            </form>
         </div>
      </div>
    </div>
  );
}
