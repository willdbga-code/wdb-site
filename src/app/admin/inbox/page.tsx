"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Loader2, MessageSquare, ArrowLeft, Trash2 } from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, getDocs, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminInbox() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let unsubscribe: any = null;

    const setupChat = async () => {
      // 1. Fetch real names to overwrite missing metadata
      const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "client")));
      const uMap: Record<string, string> = {};
      usersSnap.forEach(u => {
         const data = u.data();
         uMap[u.id] = data.full_name || data.email || "Sem Nome";
      });

      // 2. Escuta global em todas as mensagens
      const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        const grouped = new Map();
        allMsgs.forEach(msg => {
           // Usa o nome real mapeado, ou faz fallback se não existir
           let realName = uMap[msg.userId] || msg.userName || "Cliente Desconhecido";
           if (realName === "Cliente" && uMap[msg.userId]) {
              realName = uMap[msg.userId];
           }

           if (!grouped.has(msg.userId)) {
              grouped.set(msg.userId, {
                userId: msg.userId,
                userName: realName,
                lastMessage: msg.text,
                timestamp: msg.timestamp,
                messages: []
              });
           }
           const chat = grouped.get(msg.userId);
           chat.lastMessage = msg.text;
           chat.timestamp = msg.timestamp;
           chat.messages.push(msg); // Mantém a ordem asc
        });

        // Ordena contatos por última mensagem desc
        const convosArray = Array.from(grouped.values()).sort((a,b) => 
           new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setConversations(convosArray);
        
        // Se tivermos um usuário selecionado, atualiza o array de mensagens dele
        if (selectedUser) {
           const current = convosArray.find(c => c.userId === selectedUser.userId);
           if (current) setMessages(current.messages);
        }
        
        setLoading(false);
      });
    }

    setupChat();

    return () => {
       if (unsubscribe) unsubscribe();
    };
  }, [selectedUser]);

  const selectConversation = (chat: any) => {
    setSelectedUser({ userId: chat.userId, userName: chat.userName });
    setMessages(chat.messages);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const text = newMessage;
    setNewMessage("");

    try {
      await addDoc(collection(db, "messages"), {
        userId: selectedUser.userId,
        userName: selectedUser.userName,
        text: text,
        sender: "admin",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setNewMessage(text);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta mensagem permanentemente?")) return;
    try {
      await deleteDoc(doc(db, "messages", msgId));
    } catch (err) {
      console.error(err);
      alert("Falha ao apagar mensagem.");
    }
  };

  if (loading) {
     return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Lista de Conversas (Esquerda) */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-border bg-surface flex-col shrink-0`}>
         <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-serif text-white mb-2">Caixa de Entrada</h1>
            <p className="text-gray-400 font-light text-xs tracking-wide">Gerencie os contatos dos clientes.</p>
         </div>
         <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
               <div className="p-8 text-center text-gray-500 text-xs uppercase tracking-widest">Nenhuma conversa encontrada.</div>
            ) : conversations.map(chat => (
               <div 
                  key={chat.userId} 
                  onClick={() => selectConversation(chat)}
                  className={`p-4 border-b border-border cursor-pointer transition-colors ${selectedUser?.userId === chat.userId ? 'bg-primary/10 border-l-4 border-l-primary' : 'bg-black/20 hover:bg-black/40'}`}
               >
                  <div className="flex justify-between items-center mb-1">
                     <h3 className={`text-sm font-medium ${selectedUser?.userId === chat.userId ? 'text-primary' : 'text-white'}`}>{chat.userName}</h3>
                     <span className="text-[10px] text-gray-500">{new Date(chat.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{chat.lastMessage}</p>
               </div>
            ))}
         </div>
      </div>

      {/* Área Principal do Chat (Direita) */}
      {selectedUser ? (
         <div className="flex flex-col flex-1 h-full">
            {/* Cabeçalho */}
            <div className="p-6 border-b border-border bg-surface flex items-center gap-4">
               <button 
                 onClick={() => setSelectedUser(null)}
                 className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <div className="w-12 h-12 bg-border rounded-full flex items-center justify-center uppercase font-serif text-white">
                  {selectedUser.userName.charAt(0)}
               </div>
               <div>
                  <h2 className="text-white font-medium">{selectedUser.userName}</h2>
                  <p className="text-xs text-primary uppercase tracking-widest mt-1">Cliente Ativo</p>
               </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
               {messages.map((msg: any) => (
                  <div key={msg.id} className={`flex group ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                     
                     {msg.sender === 'admin' && (
                        <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-colors self-center">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     )}
                     
                     <div className={`${msg.sender === 'admin' ? 'bg-[#111] border-primary/30' : 'bg-surface/50 border-border'} border p-4 max-w-[70%]`}>
                        <p className={`${msg.sender === 'admin' ? 'text-white' : 'text-gray-300'} text-sm font-light`}>{msg.text}</p>
                        <span className={`text-[10px] uppercase tracking-widest mt-2 block ${msg.sender === 'admin' ? 'text-primary/50' : 'text-gray-500'}`}>
                           {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                     </div>
                     
                     {msg.sender !== 'admin' && (
                        <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-colors self-center">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     )}
                  </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-surface border-t border-border mt-auto">
               <form onSubmit={handleSend} className="relative flex items-center">
                  <input 
                     type="text"
                     value={newMessage}
                     onChange={e => setNewMessage(e.target.value)}
                     placeholder={`Responder a ${selectedUser.userName}...`}
                     className="w-full bg-transparent border-b border-border focus:border-primary text-white pb-3 outline-none text-sm transition-colors pr-12"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="absolute right-0 top-1 text-gray-500 hover:text-primary transition-colors disabled:opacity-50">
                     <Send className="w-5 h-5" />
                  </button>
               </form>
            </div>
         </div>
      ) : (
         <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-black/50 border-l border-border">
            <MessageSquare className="w-16 h-16 text-border mb-4" />
            <p className="text-gray-500 text-xs uppercase tracking-widest">Nenhuma conversa selecionada no InBox</p>
         </div>
      )}
    </div>
  );
}
