"use client";

import { useState, useEffect } from "react";
import { Heart, Download, Loader2, FolderOpen, ArrowLeft } from "lucide-react";
import { collection, query, getDocs, doc, writeBatch, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export default function GalleryView() {
  const { user } = useAuth();
  const [galleries, setGalleries] = useState<any[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);
  
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchGalleries = async () => {
      try {
        const q = query(collection(db, "galleries"), where("clientId", "==", user.uid));
        const snap = await getDocs(q);
        setGalleries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleries();
  }, [user]);

  const handleOpenGallery = async (gallery: any) => {
    setSelectedGallery(gallery);
    setLoadingPhotos(true);
    try {
      const q = query(collection(db, "photos"), where("galleryId", "==", gallery.id));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setPhotos(fetched);
      
      const preSelected = fetched.filter((p: any) => p.is_selected).map((p: any) => p.id);
      setSelectedPhotos(preSelected);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedPhotos(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  const included = selectedGallery?.includedPhotos || 15;
  const extraPrice = selectedGallery?.extraPhotoPrice || 30;
  const selectedCount = selectedPhotos.length;
  const extrasCount = Math.max(0, selectedCount - included);
  const extrasTotal = extrasCount * extraPrice;

  // Initial intent "Save" button
  const handleIntentSave = () => {
    if (extrasCount > 0) {
      setShowCheckoutModal(true);
    } else {
      handleFinalizeDataAndNotify('padrao');
    }
  };

  // Real write layer + WhatsApp notify
  const handleFinalizeDataAndNotify = async (paymentMethod: 'pix' | 'cartao' | 'padrao') => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      selectedPhotos.forEach(id => {
        batch.update(doc(db, "photos", id), { is_selected: true });
      });
      const unselected = photos.filter(p => !selectedPhotos.includes(p.id));
      unselected.forEach(p => {
        batch.update(doc(db, "photos", p.id), { is_selected: false });
      });
      await batch.commit();

      setShowCheckoutModal(false);

      if (paymentMethod === 'padrao') {
         alert("Seleção salva com sucesso! O fotógrafo já tem acesso à sua lista.");
         // Optionally send whatsapp for standard
      } else {
         const wppText = `Olá William!\n\nAcabei de finalizar a seleção da minha galeria *[ ${selectedGallery.title} ]*.\n\n📊 *Resumo da Escolha:*\n- Fotos Inclusas: ${included}\n- Fotos Selecionadas: ${selectedCount}\n- Fotos EXTRAS: ${extrasCount}\n\n💰 *Valor Adicional:* R$ ${extrasTotal},00\n💳 *Forma de Pagamento:* ${paymentMethod === 'pix' ? 'PIX (Comprovante em anexo/logo abaixo)' : 'Solicito Link de Cartão'}\n\nAguardando liberação dos downloads em alta!`;
         window.open(`https://wa.me/5512988130316?text=${encodeURIComponent(wppText)}`, "_blank");
      }
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao salvar sua seleção.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  // View: Lista de Galerias
  if (!selectedGallery) {
     return (
        <div className="p-8 md:p-16">
           <h1 className="text-4xl font-serif text-white mb-2">Minhas Galerias</h1>
           <p className="text-gray-400 font-light text-sm tracking-wide mb-12">
             Selecione um evento para visualizar e aprovar as fotografias entregues.
           </p>

           {galleries.length === 0 ? (
              <div className="text-center py-24 text-gray-500 text-xs tracking-widest uppercase border border-border border-dashed">
                 Nenhuma galeria foi liberada para o seu acesso ainda.
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {galleries.map(g => (
                    <div 
                       key={g.id}
                       onClick={() => handleOpenGallery(g)}
                       className="bg-surface border border-border p-8 cursor-pointer group hover:border-primary transition-colors flex flex-col items-center justify-center text-center h-48"
                    >
                       <FolderOpen className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                       <h3 className="text-white font-serif text-xl">{g.title}</h3>
                       <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Toque para Abrir</p>
                    </div>
                 ))}
              </div>
           )}
        </div>
     );
  }

  // View: Fotos Dentro da Galeria
  return (
    <div className="p-8 md:p-16">
      <button 
         onClick={() => setSelectedGallery(null)}
         className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8"
      >
         <ArrowLeft className="w-4 h-4" /> Voltar para Pastas
      </button>

      <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
         <div>
            <h1 className="text-4xl font-serif text-white mb-2">{selectedGallery.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
               <p className="text-gray-400 font-light text-sm tracking-wide">
                 <strong className={selectedCount > included ? "text-primary px-1" : "text-white"}>{selectedCount}</strong> de {included} fotos inclusas aprovadas.
               </p>
               {extrasCount > 0 && (
                  <div className="bg-primary/10 border border-primary/30 px-3 py-1 inline-flex items-center gap-2 animate-in fade-in zoom-in">
                     <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Extras:</span>
                     <span className="text-sm font-mono text-white">+{extrasCount} (R$ {extrasTotal},00)</span>
                  </div>
               )}
            </div>
         </div>
         <button 
            onClick={handleIntentSave}
            disabled={saving || photos.length === 0}
            className="flex items-center gap-3 bg-primary text-black px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 shrink-0"
         >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
            {saving ? "Salvando..." : (extrasCount > 0 ? "Revisar e Concluir" : "Salvar Seleção Grátis")}
         </button>
      </div>

      {loadingPhotos ? (
         <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : photos.length === 0 ? (
        <div className="text-center py-24 text-gray-500 text-xs tracking-widest uppercase border border-border border-dashed">
          Esta pasta ainda está vazia. O fotógrafo não enviou arquivos para cá.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map(photo => {
            const isSelected = selectedPhotos.includes(photo.id);
            return (
              <div key={photo.id} className="relative group aspect-[4/5] overflow-hidden bg-surface cursor-pointer" onClick={() => toggleSelection(photo.id)}>
                <img 
                  src={photo.url} 
                  className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'scale-105 opacity-100' : 'opacity-60 grayscale-[40%] group-hover:opacity-100 group-hover:grayscale-0'}`}
                  alt={photo.filename}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleSelection(photo.id); }}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                    isSelected 
                      ? 'bg-primary text-black scale-110 shadow-lg' 
                      : 'bg-black/50 text-white/50 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSelected ? 'fill-current' : ''}`} />
                </button>

                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                   <p className="text-[10px] uppercase tracking-widest text-white/70 font-mono break-all line-clamp-1">{photo.filename}</p>
                </div>
               </div>
            );
          })}
        </div>
      )}

      {/* Checkout Modal (Overlay) */}
      {showCheckoutModal && (
         <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-md p-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
               <h2 className="text-2xl font-serif text-white mb-2">Finalizar Mídia Extra</h2>
               <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Seu pacote incluía <strong>{included} fotos</strong>, mas você selecionou <strong>{selectedCount}</strong>.<br/> 
                  O valor de custo das <strong>{extrasCount} imagens excedentes</strong> é de:
               </p>
               
               <div className="bg-primary/5 text-primary p-4 border border-primary/20 text-center mb-6">
                  <span className="text-3xl font-mono font-bold">R$ {extrasTotal},00</span>
               </div>

               <div className="space-y-4">
                  <div className="bg-black/50 p-4 border border-border">
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Pagamento via PIX</p>
                     <p className="text-sm text-white font-serif">William Del Barrio</p>
                     <p className="text-xs text-gray-400 mb-2">Chave Celular / WhatsApp</p>
                     <div className="flex items-center gap-2">
                        <code className="flex-1 bg-black px-3 py-2 text-primary text-sm tracking-widest">12988130316</code>
                        <button 
                           onClick={() => navigator.clipboard.writeText("12988130316")}
                           className="bg-white text-black px-3 py-2 text-xs font-bold uppercase hover:bg-primary transition-colors"
                        >
                           Copiar
                        </button>
                     </div>
                  </div>

                  <button 
                     onClick={() => handleFinalizeDataAndNotify('pix')}
                     disabled={saving}
                     className="w-full bg-primary text-black font-bold py-3 text-xs uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
                  >
                     {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                     Já fiz o PIX - Enviar ao WPP
                  </button>

                  <button 
                     onClick={() => handleFinalizeDataAndNotify('cartao')}
                     disabled={saving}
                     className="w-full bg-transparent border border-border text-white font-bold py-3 text-xs uppercase tracking-widest hover:border-white transition-colors flex justify-center items-center gap-2"
                  >
                     {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                     Solicitar Link de Cartão no WPP
                  </button>

                  <button 
                     onClick={() => setShowCheckoutModal(false)}
                     className="w-full text-center text-gray-500 hover:text-white text-xs uppercase tracking-widest pt-2 transition-colors"
                  >
                     Voltar e revisar fotos
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
