"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Phone, Loader2, Copy, Trash2, CheckCircle2 } from "lucide-react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "client"));
        const snap = await getDocs(q);
        setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleDeleteClient = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja apagar os dados deste cliente do sistema? Isso não desvinculará galerias já criadas, mas ele perderá o acesso e sairá da lista de leads.")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Erro ao deletar cliente:", err);
      alert("Falha ao apagar cliente.");
    }
  };

  const handleExportLeads = () => {
    if (clients.length === 0) return;
    const leadsString = clients.map(c => `${c.full_name || 'Sem Nome'} - ${c.email} - ${c.phone || 'Sem Telefone'}`).join('\n');
    navigator.clipboard.writeText(leadsString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="p-8 md:p-16">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Clientes e CRM</h1>
          <p className="text-gray-400 font-light text-sm tracking-wide">Gerencie os cadastros e dados de contato que chegam pelo site.</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExportLeads}
              className="flex items-center gap-2 bg-transparent border border-border text-white hover:bg-white hover:text-black hover:border-white transition-colors px-4 py-2 text-xs uppercase tracking-widest"
              title="Copiar Nome, Email e Telefone"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Exportar Leads"}
            </button>
            <div className="flex items-center gap-2 text-primary font-serif italic text-xl border border-primary px-4 py-2">
              <Users className="w-5 h-5 mr-2" />
              {clients.length} Total
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-surface border border-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50">
                <th className="p-6 text-xs uppercase tracking-widest text-gray-500 font-medium">Nome</th>
                <th className="p-6 text-xs uppercase tracking-widest text-gray-500 font-medium hidden md:table-cell">E-mail</th>
                <th className="p-6 text-xs uppercase tracking-widest text-gray-500 font-medium hidden lg:table-cell">Telefone</th>
                <th className="p-6 text-xs uppercase tracking-widest text-gray-500 font-medium text-right">Membro desde</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                   <td colSpan={4} className="p-12 text-center text-gray-500 text-xs uppercase tracking-widest border-t border-border">
                     Nenhum cliente cadastrado ainda.
                   </td>
                </tr>
              ) : clients.map(client => (
                <tr key={client.id} className="border-b border-border/30 hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="p-6">
                    <p className="text-white font-medium group-hover:text-primary transition-colors">{client.full_name || "Sem Nome"}</p>
                    {/* Mobile fallback for email/phone */}
                    <p className="text-xs text-gray-500 md:hidden mt-1">{client.email}</p>
                    <p className="text-xs text-gray-500 lg:hidden mt-1">{client.phone}</p>
                  </td>
                  <td className="p-6 hidden md:table-cell text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                       <Mail className="w-3 h-3 text-primary" /> {client.email}
                    </div>
                  </td>
                  <td className="p-6 hidden lg:table-cell text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                       <Phone className="w-3 h-3 text-primary" /> {client.phone || "Não informado"}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <span className="text-gray-500 text-xs font-mono">
                        {client.created_at ? new Date(client.created_at).toLocaleDateString() : "-"}
                      </span>
                      <button 
                         onClick={(e) => handleDeleteClient(client.id, e)}
                         className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                         title="Excluir Cliente"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
