"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Package, Send, Trash2, ArrowLeft } from "lucide-react";
import { collection, query, orderBy, onSnapshot, getDocs, where, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Busca Entregas
    const q = query(collection(db, "deliveries"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setDeliveries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // Busca Clientes para o Dropdown
    const fetchClients = async () => {
      try {
        const cq = query(collection(db, "users"), where("role", "==", "client"));
        const cs = await getDocs(cq);
        setClients(cs.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchClients();

    return () => unsub();
  }, []);

  const handleCreate = async () => {
    if (!selectedUser || !title || !link) return alert("Preencha cliente, título e link!");
    setSaving(true);
    
    try {
      const clientObj = clients.find(c => c.id === selectedUser);
      await addDoc(collection(db, "deliveries"), {
        clientId: selectedUser,
        clientName: clientObj.full_name || clientObj.email,
        title,
        description,
        link,
        createdAt: new Date().toISOString()
      });
      setIsCreating(false);
      setTitle("");
      setDescription("");
      setLink("");
      setSelectedUser("");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar entrega.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar essa entrega? O cliente não terá mais acesso a este card.")) return;
    try {
       await deleteDoc(doc(db, "deliveries", id));
    } catch(e) { console.error(e) }
  };

  if (loading) return <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background">
      
      {/* Esquerda: Lista de Entregas */}
      <div className={`${isCreating ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-border bg-surface flex-col shrink-0 overflow-y-auto`}>
         <div className="p-6 border-b border-border flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-serif text-white mb-1">Entregas Finais</h1>
               <p className="text-gray-400 font-light text-[10px] tracking-widest uppercase">Módulo de Envio Direto</p>
            </div>
            <button onClick={() => setIsCreating(true)} className="lg:hidden p-2 bg-primary text-black hover:bg-white transition-colors">
               <Plus className="w-4 h-4" />
            </button>
         </div>

         {/* Nova Entrega Btn Desktop */}
         <div className="p-6 border-b border-border hidden lg:block">
            <button 
               onClick={() => setIsCreating(true)}
               className="w-full flex items-center justify-center gap-2 bg-primary text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
            >
               <Plus className="w-4 h-4" /> Nova Entrega
            </button>
         </div>

         <div className="flex-1 overflow-y-auto pb-24 lg:pb-0 p-6 space-y-4">
            {deliveries.length === 0 && <div className="text-gray-500 text-xs text-center uppercase tracking-widest mt-4">Nenhuma entrega gerada.</div>}
            
            {deliveries.map(d => (
               <div key={d.id} className="p-6 border border-border bg-black/40 group relative">
                  <h3 className="text-sm font-medium text-white mb-2">{d.title}</h3>
                  <p className="text-xs text-primary tracking-widest uppercase mb-4">Para: {d.clientName}</p>
                  
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</span>
                     <button onClick={() => handleDelete(d.id)} className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Direita: Formulário de Nova Entrega */}
      {isCreating ? (
         <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
            <div className="p-6 border-b border-border flex items-center gap-4 bg-surface">
               <button onClick={() => setIsCreating(false)} className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors shrink-0">
                  <ArrowLeft className="w-6 h-6" />
               </button>
               <div>
                  <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                     <Package className="w-6 h-6 text-primary shrink-0" /> Criar Entrega
                  </h2>
               </div>
            </div>

            <div className="p-8 md:p-12 overflow-y-auto flex-1 max-w-2xl">
               <div className="space-y-8">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Cliente Destino</label>
                    <div className="relative">
                       <select 
                          value={selectedUser} 
                          onChange={(e) => setSelectedUser(e.target.value)}
                          className="w-full bg-black border border-border text-white px-4 py-3 appearance-none focus:outline-none focus:border-primary transition-colors"
                       >
                          <option value="" disabled>Selecione um cliente...</option>
                          {clients.map(c => (
                             <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
                          ))}
                       </select>
                    </div>
                  </div>

                  <div>
                     <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Título da Entrega</label>
                     <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Ex: Ensaio Corporativo Final"
                        className="w-full bg-black border border-border text-white px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                     />
                  </div>

                  <div>
                     <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Descrição ou Mensagem (Opcional)</label>
                     <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Ex: Segue a pasta com as fotos em alta resolução. A partir desta data o link fica ativo por 6 meses."
                        className="w-full bg-black border border-border text-white px-4 py-3 h-24 resize-none focus:outline-none focus:border-primary transition-colors"
                     />
                  </div>

                  <div>
                     <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Link da Pasta Externa</label>
                     <input 
                        type="url" 
                        value={link} 
                        onChange={(e) => setLink(e.target.value)} 
                        placeholder="https://drive.google.com/..."
                        className="w-full bg-black border border-border text-white px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                     />
                  </div>

                  <button 
                     onClick={handleCreate}
                     disabled={saving}
                     className="bg-primary flex items-center justify-center gap-3 text-black hover:bg-white w-full py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50 mt-8"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                    {saving ? "Enviando..." : "Despachar Entrega"}
                  </button>
               </div>
            </div>
         </div>
      ) : (
         <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-black/50 border-l border-border">
            <Package className="w-16 h-16 text-border mb-4" />
            <p className="text-gray-500 text-xs uppercase tracking-widest text-center px-8">Nenhuma ação em andamento.<br/>Clique em "Nova Entrega" para enviar links aos clientes.</p>
         </div>
      )}
    </div>
  );
}
