"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, HardDrive, ArrowLeft, CheckSquare } from "lucide-react";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Link from "next/link";

export default function AdminStorage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const q = query(collection(db, "photos"), orderBy("uploadedAt", "desc"));
      const snap = await getDocs(q);
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      try {
         const snap = await getDocs(collection(db, "photos"));
         setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) { console.error(e) }
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleGroup = (groupPhotos: any[]) => {
    const allSelected = groupPhotos.every(p => selectedIds.includes(p.id));
    if (allSelected) {
       setSelectedIds(prev => prev.filter(id => !groupPhotos.some(p => p.id === id)));
    } else {
       const newIds = groupPhotos.map(p => p.id).filter(id => !selectedIds.includes(id));
       setSelectedIds(prev => [...prev, ...newIds]);
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Tem certeza que deseja apagar ${selectedIds.length} fotos permanentemente?`)) return;
    setDeleting(true);
    
    const photosToDelete = photos.filter(p => selectedIds.includes(p.id));
    
    try {
      await Promise.all(photosToDelete.map(async (photo) => {
         try {
           await deleteDoc(doc(db, "photos", photo.id));
           // Só deleta do storage se for URL do firebase storage (por segurança e para não falhar caso tenha dado erro antes)
           if (photo.url && photo.url.includes("firebasestorage")) {
              const storageRef = ref(storage, photo.url);
              await deleteObject(storageRef);
           }
         } catch(e) { console.error("Erro deletando:", photo.id, e) }
      }));
      setPhotos(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Erro geral no lote:", err);
      alert("Alguns arquivos não puderam ser excluídos.");
    } finally {
      setDeleting(false);
    }
  };

  // Grouping logic
  const groupedPhotos = photos.reduce((acc, p) => {
    let dateStr = "Sem Data";
    if (p.uploadedAt) {
       const d = new Date(p.uploadedAt);
       dateStr = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
       dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  const groupKeys = Object.keys(groupedPhotos);

  if (loading) return <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-8 md:p-16 pb-32">
      <Link href="/admin" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8">
         <ArrowLeft className="w-4 h-4" /> Voltar ao Resumo
      </Link>
      
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Central de Armazenamento</h1>
          <p className="text-gray-400 font-light text-sm tracking-wide">Visualize e apague em lote o conteúdo que ocupa espaço em disco na nuvem.</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-primary font-serif italic text-xl border border-primary px-4 py-2">
            <HardDrive className="w-5 h-5 mr-2" />
            {photos.length} Arquivos
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="p-16 text-center text-gray-500 text-xs tracking-widest uppercase border border-border border-dashed">
          Seu armazenamento em nuvem está vazio. Parabéns!
        </div>
      ) : (
        <div className="space-y-12">
          {groupKeys.map(group => (
             <div key={group}>
                <div className="flex items-center justify-between border-b border-border pb-2 mb-6 text-gray-400">
                   <h2 className="text-sm font-serif uppercase tracking-widest">{group} <span className="text-xs text-gray-600">({groupedPhotos[group].length})</span></h2>
                   <button 
                      onClick={() => toggleGroup(groupedPhotos[group])}
                      className="text-[10px] tracking-widest uppercase hover:text-white transition-colors flex items-center gap-2"
                   >
                     <CheckSquare className="w-3 h-3" />
                     {groupedPhotos[group].every((p:any) => selectedIds.includes(p.id)) ? "Desmarcar Todos" : "Selecionar Todos"}
                   </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {groupedPhotos[group].map((p: any) => {
                    const isSelected = selectedIds.includes(p.id);
                    return (
                      <div 
                         key={p.id} 
                         onClick={() => toggleSelect(p.id)}
                         className={`relative group aspect-square bg-surface border cursor-pointer overflow-hidden transition-all ${isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-border'}`}
                      >
                         <img src={p.url} alt={p.filename} className={`w-full h-full object-cover transition-all ${isSelected ? 'opacity-100 scale-105' : 'opacity-70 group-hover:opacity-100'}`} />
                         
                         <div className={`absolute top-2 left-2 flex items-center justify-center w-5 h-5 rounded-full border overflow-hidden transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-white/50 bg-black/50'}`}>
                            {isSelected && <CheckSquare className="w-3 h-3 text-black" />}
                         </div>

                         <div className="absolute bottom-0 inset-x-0 bg-black/80 px-2 py-1">
                            <p className="text-[9px] text-gray-300 truncate">{p.filename || 'Sem nome'}</p>
                         </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          ))}
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface border border-border px-8 py-4 flex items-center gap-8 shadow-2xl z-50 rounded-lg">
            <span className="text-sm font-serif italic text-primary">{selectedIds.length} arquivos selecionados</span>
            <button 
               onClick={handleDeleteSelected}
               disabled={deleting}
               className="bg-red-600/90 hover:bg-red-500 text-white px-6 py-2 text-xs uppercase tracking-widest font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
            >
               {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
               {deleting ? 'Apagando...' : 'Excluir Lote'}
            </button>
         </div>
      )}
    </div>
  );
}
