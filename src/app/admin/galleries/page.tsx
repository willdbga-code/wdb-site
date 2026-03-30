"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Copy, CheckCircle2, Loader2, Trash2, Plus, Users, FolderOpen, ArrowLeft } from "lucide-react";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, orderBy, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";

export default function AdminGalleries() {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  
  // States of new gallery formulation
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newIncluded, setNewIncluded] = useState(15);
  const [newExtraPrice, setNewExtraPrice] = useState(30);
  const [creating, setCreating] = useState(false);

  const [copiedLR, setCopiedLR] = useState(false);
  const [copiedWin, setCopiedWin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [deliveryLink, setDeliveryLink] = useState("");

  // Fetch initial data (galleries & clients)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const gSnap = await getDocs(query(collection(db, "galleries"), orderBy("created_at", "desc")));
      setGalleries(gSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const cSnap = await getDocs(query(collection(db, "users"), where("role", "==", "client")));
      setClients(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotosForGallery = async (galleryId: string) => {
    try {
      const q = query(collection(db, "photos"), where("galleryId", "==", galleryId));
      const snap = await getDocs(q);
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectGallery = (g: any) => {
      setSelectedGallery(g);
      setDeliveryLink(g.deliveryLink || "");
      setPhotos([]); // Clear while loading
      loadPhotosForGallery(g.id);
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle || !newClient) return;
      setCreating(true);

      const clientObj = clients.find(c => c.id === newClient);

      try {
         await addDoc(collection(db, "galleries"), {
             title: newTitle,
             clientId: newClient,
             clientName: clientObj?.full_name || "Desconhecido",
             includedPhotos: newIncluded,
             extraPhotoPrice: newExtraPrice,
             created_at: new Date().toISOString()
         });
         setNewTitle("");
         setNewClient("");
         fetchData();
      } catch (err) {
         console.error(err);
      } finally {
         setCreating(false);
      }
  };

  const handleDeleteGallery = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Tem certeza que deseja deletar esta galeria? As fotos no Firebase continuarão existindo, mas o link será quebrado.")) return;
      
      try {
          await deleteDoc(doc(db, "galleries", id));
          if (selectedGallery?.id === id) setSelectedGallery(null);
          fetchData();
      } catch(err) {
         console.error(err);
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedGallery) return alert("Selecione uma galeria primeiro!");
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    let uploadedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Enviando ${i + 1} de ${files.length}...`);
      
      try {
        const storageRef = ref(storage, `galleries/${selectedGallery.id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        
        await addDoc(collection(db, "photos"), {
          filename: file.name,
          url: url,
          uploadedAt: new Date().toISOString(),
          galleryId: selectedGallery.id,
          is_selected: false
        });
        
        uploadedCount++;
      } catch (err) {
        console.error("Erro no upload de", file.name, err);
      }
    }

    setUploading(false);
    setUploadProgress("");
    if (uploadedCount > 0) {
      loadPhotosForGallery(selectedGallery.id);
    }
  };

  const handleCopyLightroom = () => {
    const selectedFiles = photos.filter(p => p.is_selected).map(p => p.filename);
    if (selectedFiles.length === 0) return alert("Nenhuma foto favoritada.");
    navigator.clipboard.writeText(selectedFiles.join(", "));
    setCopiedLR(true);
    setTimeout(() => setCopiedLR(false), 2000);
  };

  const handleCopyWindows = () => {
    const selectedFiles = photos.filter(p => p.is_selected).map(p => p.filename);
    if (selectedFiles.length === 0) return alert("Nenhuma foto favoritada.");
    navigator.clipboard.writeText(selectedFiles.join(" OR "));
    setCopiedWin(true);
    setTimeout(() => setCopiedWin(false), 2000);
  };

  const handleDeletePhoto = async (photo: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja apagar esta foto definitivamente? O arquivo será apagado para economizar espaço.")) return;
    
    try {
      await deleteDoc(doc(db, "photos", photo.id));
      const storageRef = ref(storage, photo.url);
      await deleteObject(storageRef);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch (err) {
      console.error("Erro ao apagar foto:", err);
      alert("Não foi possível excluir a imagem. Verifique o console.");
    }
  };

  const handleSaveDeliveryLink = async () => {
    if (!selectedGallery) return;
    try {
      await updateDoc(doc(db, "galleries", selectedGallery.id), { deliveryLink });
      setSelectedGallery({ ...selectedGallery, deliveryLink });
      fetchData(); // atualiza a lista de galerias lateral
      alert("Link de entrega salvo com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar link.");
    }
  };

  if (loading) return <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-screen overflow-hidden bg-background">
      
      {/* Esquerda: Lista de Galerias e Criador */}
      <div className={`${selectedGallery ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 border-r border-border bg-surface flex-col shrink-0 overflow-y-auto`}>
         <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-serif text-white mb-2">Administrar Galerias</h1>
            <p className="text-gray-400 font-light text-xs tracking-wide">Crie álbuns e libere acessos por cliente.</p>
         </div>

         {/* Formulário Criar Galeria */}
         <div className="p-6 border-b border-border bg-black/50">
            <h3 className="text-xs uppercase tracking-widest text-white mb-4">Nova Galeria</h3>
            <form onSubmit={handleCreateGallery} className="space-y-4">
               <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Nome do Evento (ex: Casamento Jane)"
                  className="w-full bg-transparent border-b border-border focus:border-primary text-white pb-2 outline-none text-sm transition-colors"
                  required
               />
               <select 
                  value={newClient}
                  onChange={e => setNewClient(e.target.value)}
                  className="w-full bg-transparent border-b border-border focus:border-primary text-gray-400 pb-2 outline-none text-sm transition-colors cursor-pointer"
                  required
               >
                  <option value="" className="bg-black text-gray-400">Atribuir a um cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id} className="bg-black text-white">{c.full_name}</option>)}
               </select>

               <div className="flex gap-4">
                 <div className="w-1/2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest">Fotos Inclusas no Pacote</label>
                    <input 
                       type="number" 
                       value={newIncluded}
                       onChange={e => setNewIncluded(Number(e.target.value))}
                       min={1}
                       className="w-full bg-transparent border-b border-border focus:border-primary text-white pb-1 pt-1 outline-none text-sm transition-colors"
                       required
                    />
                 </div>
                 <div className="w-1/2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest">Valor da Foto Extra (R$)</label>
                    <input 
                       type="number" 
                       value={newExtraPrice}
                       onChange={e => setNewExtraPrice(Number(e.target.value))}
                       min={0}
                       className="w-full bg-transparent border-b border-border focus:border-primary text-white pb-1 pt-1 outline-none text-sm transition-colors"
                       required
                    />
                 </div>
               </div>

               <button type="submit" disabled={creating} className="w-full bg-primary text-black py-3 text-xs uppercase tracking-widest font-bold mt-2 disabled:opacity-50 hover:bg-white transition-colors">
                  {creating ? "Criando..." : "Criar Galeria"}
               </button>
            </form>
         </div>

         {/* Lista de Galerias */}
         <div className="flex-1 overflow-y-visible pb-24 lg:pb-0">
            {galleries.length === 0 && <div className="p-6 text-gray-500 text-xs text-center uppercase tracking-widest mt-4">Nenhuma galeria criada.</div>}
            {galleries.map(g => (
               <div 
                  key={g.id} 
                  onClick={() => handleSelectGallery(g)}
                  className={`p-5 border-b border-border cursor-pointer transition-colors group flex justify-between items-start ${selectedGallery?.id === g.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'bg-transparent hover:bg-white/5'}`}
               >
                  <div>
                     <h4 className={`font-serif text-lg ${selectedGallery?.id === g.id ? 'text-primary' : 'text-white'}`}>{g.title}</h4>
                     <p className="text-gray-500 flex items-center gap-1 text-xs mt-1">
                        <Users className="w-3 h-3" /> {g.clientName}
                     </p>
                  </div>
                  <button onClick={(e) => handleDeleteGallery(g.id, e)} className="text-gray-600 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            ))}
         </div>
      </div>

      {/* Direita: Gestão da Galeria Selecionada */}
      {selectedGallery ? (
         <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Cabecalho da Galeria */}
            <div className="p-6 border-b border-border bg-surface flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div className="flex items-center gap-4">
                  <button 
                     onClick={() => setSelectedGallery(null)}
                     className="lg:hidden p-2 -ml-2 shrink-0 text-gray-400 hover:text-white transition-colors"
                  >
                     <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div>
                     <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                        <FolderOpen className="w-6 h-6 text-primary shrink-0" /> <span className="truncate">{selectedGallery.title}</span>
                     </h2>
                     <p className="text-gray-400 text-sm mt-1">
                        Uploads para o cliente <strong>{selectedGallery.clientName}</strong>
                     </p>
                  </div>
               </div>
               
               <label className={`flex items-center gap-3 bg-white text-black px-6 py-3 text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} 
                  {uploading ? uploadProgress : "Subir Fotos"}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
               </label>
            </div>

            {/* Area de Fotos e Exportadores */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
               
               {/* Grid de Fotos */}
               <div className="flex-1 space-y-4">
                  <h3 className="text-white font-serif text-xl border-b border-border pb-2">Fotos Atuais ({photos.length})</h3>
                  {photos.length === 0 ? (
                     <div className="text-center py-16 text-gray-500 uppercase tracking-widest text-xs border border-dashed border-border">Galeria vazia. Envie imagens novas acima.</div>
                  ) : (
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {photos.map(p => (
                           <div key={p.id} className="relative aspect-square group overflow-hidden border border-border">
                              <img src={p.url} className={`w-full h-full object-cover transition-opacity ${p.is_selected ? 'opacity-100' : 'opacity-60 grayscale-[50%]'}`} />
                              <div className="absolute inset-x-0 bottom-0 bg-black/80 text-center py-1">
                                 <p className="text-[10px] text-white break-all truncate px-1">{p.filename}</p>
                              </div>
                              <button 
                                 onClick={(e) => handleDeletePhoto(p, e)} 
                                 className="absolute top-2 left-2 flex items-center justify-center w-6 h-6 bg-red-600/90 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                 title="Excluir Definitivamente"
                              >
                                 <Trash2 className="w-3 h-3 text-white" />
                              </button>
                              {p.is_selected && (
                                <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-primary rounded-full" title="Foto Aprovada">
                                    <CheckCircle2 className="w-4 h-4 text-black" />
                                </div>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Barra Lateral de Exportadores */}
               <div className="w-full lg:w-80 space-y-6">
                  <div className="border border-border bg-surface p-6">
                     <h3 className="text-white text-lg font-serif mb-4">Exportadores</h3>
                     <p className="text-gray-400 text-xs mb-6 tracking-wide leading-relaxed">
                        Exporte as seleções feitas pelo cliente ({photos.filter(p => p.is_selected).length} aprovadas).
                     </p>

                     <button 
                        onClick={handleCopyLightroom}
                        disabled={photos.filter(p => p.is_selected).length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-black border border-border text-white hover:bg-primary hover:text-black hover:border-primary transition-colors py-3 text-xs uppercase tracking-widest mb-3 disabled:opacity-50"
                     >
                        {copiedLR ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedLR ? "Copiado!" : "Copiar CSV (Lightroom)"}
                     </button>

                     <button 
                        onClick={handleCopyWindows}
                        disabled={photos.filter(p => p.is_selected).length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-black border border-border text-white hover:bg-white hover:text-black hover:border-white transition-colors py-3 text-xs uppercase tracking-widest disabled:opacity-50"
                     >
                        {copiedWin ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedWin ? "Copiado!" : "Copiar OR (Windows)"}
                     </button>
                     <div className="mt-6 border-t border-border/50 pt-4">
                         <p className="text-[10px] text-gray-500 uppercase tracking-widest">Amostra:</p>
                         <p className="text-xs text-primary font-mono mt-1 break-all line-clamp-3">
                            {photos.filter(p => p.is_selected).length > 0 ? photos.filter(p => p.is_selected).map(p => p.filename).join(", ") : "Nenhuma..."}
                         </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      ) : (
         <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-black/50 border-l border-border">
            <FolderOpen className="w-16 h-16 text-border mb-4" />
            <p className="text-gray-500 text-xs uppercase tracking-widest text-center px-8">Selecione uma galeria no menu à esquerda<br/>para realizar envios e exports.</p>
         </div>
      )}
    </div>
  );
}
