"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
};

export default function LeadBotPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      if (messages.length === 0) {
        setMessages([{
          id: '1',
          sender: 'bot',
          text: "Olá! Sou a inteligência artificial do William Del Barrio. Auxilio no atendimento! Qual tipo de experiência fotográfica você busca vivenciar hoje?",
          options: ["Retrato Autoral", "Family Legacy", "Authority & Branding", "Cinematic Wedding"]
        }]);
      }
    };
    window.addEventListener('open-lead-bot', handleOpen as EventListener);
    return () => window.removeEventListener('open-lead-bot', handleOpen as EventListener);
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addBotMessage = (text: string, options?: string[], delay = 500) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), sender: 'bot', text, options }]);
    }, delay);
  };

  const parseMarkdownLinks = (text: string) => {
    // Evitar undefined 
    if (!text) return "";
    // Previne injeções básicas transformando newline em <br> se quiser, mas o css pre-wrap resolve.
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-white transition-colors">$1</a>');
  };

  const processResponse = async (text: string) => {
    // Add user message
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].sender === 'bot') {
        newMsgs[newMsgs.length - 1].options = undefined;
      }
      return [...newMsgs, { id: Date.now().toString(), sender: 'user', text }];
    });

    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: messages,
          message: text
        })
      });

      const data = await res.json();
      let botText = data.response;

      if (!botText) botText = "Desculpe, tive um problema na resposta.";

      // Handle WhatsApp Redirect
      const transferMatch = botText.match(/\[TRANSFER_WHATSAPP([\s\S]*?)\]/);
      
      if (transferMatch || botText.includes('[TRANSFER_WHATSAPP]')) {
        let payload = "";
        if (transferMatch) {
           payload = transferMatch[1].trim();
           botText = botText.replace(/\[TRANSFER_WHATSAPP[\s\S]*?\]/, '').trim();
           
           // CRM Automático: Salva no banco de dados do Firebase
           try {
             addDoc(collection(db, "leads"), {
               timestamp: new Date().toISOString(),
               source: "IA Bot",
               payload: payload,
               status: "novo"
             });
           } catch(e) { console.error("Erro ao salvar lead automático", e) }
           
        } else {
           botText = botText.replace('[TRANSFER_WHATSAPP]', '').trim();
        }

        addBotMessage(botText || "Perfeito! Tudo anotado.", undefined, 0);
        
        setTimeout(() => {
          const welcomeMsg = encodeURIComponent(`Olá William! Falei com a sua IA no site e gostaria de focar no meu agendamento.\n\n*Resumo do Pedido:*\n${payload}`);
          const waUrl = `https://wa.me/5512988130316?text=${welcomeMsg}`;
          
          addBotMessage(`Transferindo você para o WhatsApp do William... Se a tela não abrir, [clique aqui para continuar](${waUrl})`, undefined, 1000);
          
          setTimeout(() => {
             try { window.open(waUrl, "_blank"); } catch (e) {}
             // Não fechamos mais o chat (setIsOpen(false)) imediatamente para que o usuário consiga ver o link caso o popup seja bloqueado.
          }, 3500);
        }, 1500);
      } else {
        addBotMessage(botText, undefined, 0);
      }

    } catch (err) {
      console.error(err);
      addBotMessage("Desculpe, minha rede oscilou. Poderia enviar novamente?", undefined, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const currentText = inputText;
    setInputText("");
    processResponse(currentText);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-[100] w-[90vw] md:w-[400px] h-[600px] bg-surface border border-border flex flex-col shadow-2xl overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="bg-[#111] p-4 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-primary/20 text-primary font-serif flex items-center justify-center rounded-full shrink-0 border border-primary/50 text-xs shadow-[0_0_15px_rgba(255,255,255,0.1)]">W</div>
               <div>
                  <h3 className="text-white text-sm font-serif uppercase tracking-widest">WDB Copilot</h3>
                  <span className="text-[10px] text-green-500 uppercase tracking-widest flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Inteligência Ativa
                  </span>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
             {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                   <div 
                      className={`p-3 text-sm font-light max-w-[85%] leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-primary text-black' : 'bg-[#1a1a1a] text-gray-200 border border-white/5 shadow-md'}`}
                      dangerouslySetInnerHTML={{ __html: msg.sender === 'bot' ? parseMarkdownLinks(msg.text) : msg.text }}
                   />
                   
                   {msg.options && (
                      <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in duration-500">
                         {msg.options.map((opt) => (
                            <button 
                               key={opt}
                               onClick={() => {
                                 if(!isLoading) processResponse(opt);
                               }}
                               className="text-xs tracking-wide bg-background border border-primary/50 text-white hover:bg-primary hover:text-black transition-colors px-3 py-2 text-left"
                            >
                               {opt}
                            </button>
                         ))}
                      </div>
                   )}
                </div>
             ))}
             {isLoading && (
               <div className="flex flex-col items-start">
                  <div className="p-3 bg-[#1a1a1a] text-gray-400 border border-white/5 shadow-md flex gap-1 items-center">
                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#111] border-t border-white/10">
             <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                   type="text"
                   value={inputText}
                   onChange={e => setInputText(e.target.value)}
                   disabled={isLoading} 
                   placeholder={isLoading ? "Pensando..." : "Digite aqui sua dúvida ou agendamento..."}
                   className="flex-1 bg-background border border-border text-white text-xs px-3 py-3 outline-none focus:border-primary disabled:opacity-50"
                />
                <button 
                   type="submit"
                   disabled={!inputText.trim() || isLoading}
                   className="bg-primary text-black p-3 hover:bg-white transition-colors disabled:opacity-50 shrink-0"
                >
                   <Send className="w-4 h-4" />
                </button>
             </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
