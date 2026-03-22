"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";

export default function AdminPortfolio() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("casamentos");
  
  const categories = [
    { value: "casamentos", label: "Casamentos" },
    { value: "ensaios", label: "Ensaios Editoriais" },
    { value: "comerciais", label: "Imagem Comercial" }
  ];

  const fetchPhotos = async () => {
    try {
      const q = query(collection(db, "portfolio_public"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPhotos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    let uploaded = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const storageRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        await addDoc(collection(db, "portfolio_public"), {
          title: file.name.split('.')[0],
          url: url,
          category: category,
          createdAt: new Date().toISOString()
        });
        uploaded++;
      } catch (err) {
        console.error(err);
      }
    }

    setUploading(false);
    if (uploaded > 0) fetchPhotos();
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Remover esta foto do portfólio público?")) return;
    try {
      await deleteDoc(doc(db, "portfolio_public", id));
      // Note: In a full production app you'd also delete from Storage here.
      fetchPhotos();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-8 md:p-16 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 pb-8 border-b border-border">
         <div>
            <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
               <ImageIcon className="w-8 h-8 text-primary" /> Gestão de Portfólio
            </h1>
            <p className="text-gray-400 font-light text-sm tracking-wide">
              Mude a vitrine pública do seu site. Estas fotos ficarão disponíveis para qualquer visitante.
            </p>
         </div>
         
         <div className="flex flex-col items-end gap-3">
            <select 
               value={category}
               onChange={e => setCategory(e.target.value)}
               className="bg-black border border-border text-white text-xs px-4 py-3 uppercase tracking-widest outline-none focus:border-primary"
            >
               {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            
            <label className={`flex items-center gap-3 bg-white text-black px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
               {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} 
               {uploading ? "Enviando..." : "Adicionar Fotos"}
               <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
         </div>
      </div>

      <div className="space-y-16">
         {categories.map(cat => (
            <div key={cat.value}>
               <h3 className="text-xl font-serif text-white mb-6 uppercase tracking-widest border-l-2 border-primary pl-4">
                  {cat.label}
               </h3>
               
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.filter(p => p.category === cat.value).map(photo => (
                     <div key={photo.id} className="relative aspect-[4/5] bg-surface group overflow-hidden border border-border">
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all" />
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                           <button 
                              onClick={() => handleDelete(photo.id, photo.url)}
                              className="self-end bg-red-500/80 text-white p-2 hover:bg-red-500 rounded-full transition-colors"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                           <p className="text-xs text-white font-mono truncate">{photo.title}</p>
                        </div>
                     </div>
                  ))}
                  
                  {photos.filter(p => p.category === cat.value).length === 0 && (
                     <div className="col-span-full py-8 text-xs uppercase tracking-widest text-gray-500 border border-dashed border-border border-l-0 border-r-0 text-center">
                        Nenhuma fotografia adicionada a esta sessão.
                     </div>
                  )}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
