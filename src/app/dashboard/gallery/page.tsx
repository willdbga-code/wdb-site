"use client";

import { useState, useEffect, Suspense } from "react";
import { 
  Heart, 
  Download, 
  Loader2, 
  FolderOpen, 
  ArrowLeft, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  ArrowDown
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, query, getDocs, doc, writeBatch, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { getPublicImageUrl } from "@/lib/blob";
import { motion, AnimatePresence } from "framer-motion";

function GalleryViewContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const isSuccess = searchParams?.get("success");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccessPopup(true);
      setTimeout(() => router.replace("/dashboard/gallery", undefined), 1000);
    }
  }, [isSuccess, router]);

  const [galleries, setGalleries] = useState<any[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<any | null>(null);
  
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selective Lighting (Spotlight) State
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchGalleries = async () => {
      try {
        const q = query(collection(db, "galleries"), where("clientId", "==", user.uid));
        const snap = await getDocs(q);
        setGalleries(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            coverPhotoUrl: getPublicImageUrl((d.data() as any).coverPhotoUrl),
          }))
        );
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
      const fetched = snap.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
            url: getPublicImageUrl((d.data() as any).url),
          } as any)
      );
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
    setSelectedPhotos((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  const included = selectedGallery?.includedPhotos || 15;
  const extraPrice = selectedGallery?.extraPhotoPrice || 30;
  const selectedCount = selectedPhotos.length;
  const extrasCount = Math.max(0, selectedCount - included);
  const extrasTotal = extrasCount * extraPrice;

  const handleIntentSave = () => {
    if (extrasCount > 0) {
      setShowCheckoutModal(true);
    } else {
      handleFinalizeDataAndNotify("padrao");
    }
  };

  const handleFinalizeDataAndNotify = async (paymentMethod: "pix" | "cartao" | "padrao") => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      selectedPhotos.forEach((id) => {
        batch.update(doc(db, "photos", id), { is_selected: true });
      });
      const unselected = photos.filter((p) => !selectedPhotos.includes(p.id));
      unselected.forEach((p) => {
        batch.update(doc(db, "photos", p.id), { is_selected: false });
      });
      await batch.commit();

      setShowCheckoutModal(false);

      if (paymentMethod === "padrao") {
        alert("Seleção salva com sucesso! O fotógrafo já tem acesso à sua curadoria.");
      } else if (paymentMethod === "cartao") {
        const result = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountCents: extrasTotal * 100,
            description: `Fotos Extras (${extrasCount} un) - Galeria ${selectedGallery.title}`,
            customerEmail: user?.email,
            customerName: user?.fullName || selectedGallery.clientName,
            metadata: {
              galleryId: selectedGallery.id,
              galleryTitle: selectedGallery.title,
              clientId: user?.uid,
              extraPhotosCount: extrasCount,
            },
          }),
        });

        const data = await result.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          alert("Erro ao gerar link de pagamento.");
        }
      } else if (paymentMethod === "pix") {
        const message = `Olá Will! Salvei a curadoria da minha galeria *${selectedGallery.title}* com *${extrasCount} fotos extras* e fiz o PIX de *R$ ${extrasTotal},00* para confirmação.`;
        window.open(`https://wa.me/5512988130316?text=${encodeURIComponent(message)}`, "_blank");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar seleções.");
    } finally {
      setSaving(false);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, photos]);

  if (loading) {
    return (
      <div className="p-24 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-gray-500">
          Carregando Pavilhão de Obras...
        </span>
      </div>
    );
  }

  // 1. VIEW: LISTA DE GALERIAS (Cards de Entrada)
  if (!selectedGallery) {
    return (
      <div className="p-8 md:p-16 max-w-7xl mx-auto min-h-screen">
        <div className="mb-16 border-b border-border/50 pb-8">
          <span className="text-primary font-mono text-xs tracking-[0.4em] uppercase block mb-3">
            Coleções Exclusivas
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">Suas Galerias</h1>
          <p className="text-gray-400 font-light text-sm max-w-xl">
            Selecione uma coleção para ingressar na sua experiência de galeria de arte privada e realizar a seleção das suas obras.
          </p>
        </div>

        {galleries.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-xs tracking-[0.2em] uppercase border border-border border-dashed">
            Nenhuma galeria liberada para o seu perfil no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleries.map((g) => {
              const coverImg = g.coverPhotoUrl || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2500";
              return (
                <div
                  key={g.id}
                  onClick={() => handleOpenGallery(g)}
                  className="group relative aspect-[3/4] bg-surface border border-border/80 overflow-hidden cursor-pointer flex flex-col justify-end p-8 transition-all duration-700 hover:border-primary/60 hover:shadow-[0_0_50px_rgba(212,175,55,0.15)]"
                >
                  {/* Background Cover Image with Zoom */}
                  <img
                    src={coverImg}
                    alt={g.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                  />
                  
                  {/* Atmospheric Dark Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                  {/* Content Overlay */}
                  <div className="relative z-20 space-y-2">
                    <span className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase block">
                      EXPOSIÇÃO PRIVADA
                    </span>
                    <h3 className="text-2xl md:text-3xl font-serif text-white group-hover:text-primary transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-light flex items-center justify-between pt-4 border-t border-white/10">
                      <span>{g.includedPhotos || 15} fotos inclusas</span>
                      <span className="text-primary uppercase tracking-widest text-[10px] group-hover:translate-x-1 transition-transform">
                        Abrir Galeria →
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 2. VIEW: GALERIA DE ARTE ABERTA (Hero Section + Grids Grandes com Iluminação Seletiva)
  const heroImage = selectedGallery.coverPhotoUrl || (photos.length > 0 ? photos[0].url : "");

  return (
    <div className="min-h-screen bg-background pb-40">
      
      {/* Back Button Floating Header */}
      <div className="fixed top-6 left-6 md:left-12 z-50">
        <button
          onClick={() => setSelectedGallery(null)}
          className="flex items-center gap-2 bg-black/70 hover:bg-black text-gray-300 hover:text-white px-4 py-2 text-xs uppercase tracking-widest border border-white/10 backdrop-blur-md transition-all shadow-xl rounded-full"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar às Pastas
        </button>
      </div>

      {/* ============================================================ */}
      {/* 🏛️ HERO SECTION CINEMATOGRÁFICO DA GALERIA */}
      {/* ============================================================ */}
      <section className="relative h-[80vh] md:h-[88vh] w-full overflow-hidden flex items-end pb-16 md:pb-24 px-6 md:px-16 lg:px-24">
        {/* Background Cover Image with Slow Zoom Animation */}
        {heroImage ? (
          <motion.div
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img
              src={heroImage}
              alt={selectedGallery.title}
              className="w-full h-full object-cover object-center grayscale-[20%] contrast-110"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-surface z-0" />
        )}

        {/* Chiaroscuro Museum Lighting Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/60 z-10" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/80 pointer-events-none z-10" />

        {/* Hero Content */}
        <div className="relative z-20 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary" />
              <span className="text-primary font-mono text-[11px] tracking-[0.4em] uppercase">
                GALERIA EXCLUSIVA • WILLIAM DEL BARRIO
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-light text-white tracking-tight leading-none uppercase">
              {selectedGallery.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-8 pt-4 text-xs tracking-widest text-gray-300 uppercase font-mono">
              <span>Cliente: <strong className="text-white font-serif tracking-normal text-sm normal-case">{selectedGallery.clientName || "Exclusivo"}</strong></span>
              <span>•</span>
              <span>Obras na Exposição: <strong className="text-primary">{photos.length}</strong></span>
              <span>•</span>
              <span>Curadoria: <strong className={selectedCount > included ? "text-primary font-bold" : "text-white"}>{selectedCount}</strong> / {included} fotos inclusas</span>
            </div>

            <div className="pt-6">
              <a
                href="#obras"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/80 hover:text-primary transition-colors border-b border-primary/50 pb-1 group"
              >
                <span>Entrar no Pavilhão de Obras</span>
                <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform text-primary" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 🎁 AVISO DE FOTOS PRONTAS NO GOOGLE DRIVE (SE HOUVER) */}
      {/* ============================================================ */}
      {selectedGallery.deliveryLink && (
        <div className="max-w-7xl mx-auto px-6 md:px-16 pt-12">
          <div className="border border-primary bg-primary/5 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest mb-2 font-mono">
                <Sparkles className="w-4 h-4" /> Entrega Final Pronta
              </div>
              <h3 className="text-2xl font-serif text-white mb-1">Suas obras em alta resolução estão disponíveis!</h3>
              <p className="text-gray-400 text-sm tracking-wide">
                Acesse a sua pasta exclusiva no Google Drive para baixar os arquivos originais finalizados.
              </p>
            </div>
            <a
              href={selectedGallery.deliveryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-black font-bold uppercase tracking-widest text-xs px-8 py-4 hover:bg-white transition-colors shrink-0 text-center"
            >
              Acessar Pasta no Drive
            </a>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 🖼️ GRIDS GRANDES COM ILUMINAÇÃO SELETIVA (CHIAROSCURO) */}
      {/* ============================================================ */}
      <section id="obras" className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 pt-20">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/50 pb-6 mb-12 gap-4">
          <div>
            <span className="text-primary font-mono text-[10px] tracking-[0.3em] uppercase block mb-1">
              PAVILHÃO PRINCIPAL
            </span>
            <h2 className="text-3xl font-serif text-white">Acervo de Obras</h2>
          </div>

          <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">
            Toque no coração para selecionar • Clique na obra para ampliar
          </p>
        </div>

        {loadingPhotos ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs uppercase tracking-widest text-gray-500 font-mono">
              Posicionando Obras de Arte...
            </span>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-24 text-gray-500 text-xs tracking-widest uppercase border border-border border-dashed">
            Esta galeria ainda não possui fotos enviadas pelo fotógrafo.
          </div>
        ) : (
          /* Large Selective Lighting Grid */
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
            onMouseLeave={() => setHoveredPhotoId(null)}
          >
            {photos.map((photo, index) => {
              const isSelected = selectedPhotos.includes(photo.id);
              const isHovered = hoveredPhotoId === photo.id;
              const hasHoverActive = hoveredPhotoId !== null;

              // Alternating elegant aspect ratios for art exhibition rhythm
              const aspectClass = index % 5 === 0 ? "aspect-[4/5] md:col-span-2 lg:col-span-2" : "aspect-[3/4]";

              return (
                <div
                  key={photo.id}
                  onMouseEnter={() => setHoveredPhotoId(photo.id)}
                  onClick={() => setLightboxIndex(index)}
                  className={`group relative ${aspectClass} bg-[#0c0c0c] border transition-all duration-700 cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-primary shadow-[0_0_40px_rgba(212,175,55,0.25)] ring-1 ring-primary/60"
                      : "border-border/60 hover:border-primary/50"
                  } ${
                    hasHoverActive && !isHovered && !isSelected
                      ? "opacity-35 grayscale-[70%] scale-[0.98] blur-[0.3px]"
                      : "opacity-100 grayscale-0 scale-100"
                  }`}
                >
                  {/* Photo Display with High-End Color & Contrast Transitions */}
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-all duration-1000 ease-out ${
                      isHovered ? "scale-[1.03]" : "scale-100"
                    } ${isSelected ? "opacity-100" : "opacity-90"}`}
                  />

                  {/* Selective Lighting Vignette Spotlight Glow */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
                      isHovered
                        ? "bg-radial-gradient from-transparent via-black/10 to-black/40 opacity-100"
                        : "bg-black/20 opacity-40"
                    }`}
                  />

                  {/* Top Floating Selection Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(photo.id);
                    }}
                    title={isSelected ? "Remover da Curadoria" : "Selecionar esta Obra"}
                    className={`absolute top-4 right-4 z-20 p-3.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-xl ${
                      isSelected
                        ? "bg-primary text-black scale-110 shadow-[0_0_20px_rgba(212,175,55,0.6)] ring-2 ring-white"
                        : "bg-black/60 text-white/60 hover:text-white hover:bg-black/90 hover:scale-105"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSelected ? "fill-black" : ""}`} />
                  </button>

                  {/* Expand / View Button */}
                  <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-gray-300 border border-white/10 rounded-full">
                      <Eye className="w-3.5 h-3.5 text-primary" /> Ampliar
                    </span>
                  </div>

                  {/* Museum Artwork Placard (Bottom Bar) */}
                  <div className="relative z-20 bg-gradient-to-t from-black via-black/80 to-transparent p-5 pt-10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-primary tracking-[0.3em] uppercase block">
                        OBRA #{String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-xs text-white font-mono truncate max-w-[200px]" title={photo.filename}>
                        {photo.filename}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary font-bold bg-primary/10 border border-primary/30 px-2.5 py-1 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprovada
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 🔍 FULLSCREEN ART EXHIBITION LIGHTBOX */}
      {/* ============================================================ */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 animate-in fade-in duration-300"
        >
          {/* Lightbox Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between border-b border-white/10 pb-4 text-white"
          >
            <div>
              <span className="text-primary font-mono text-xs uppercase tracking-widest block">
                OBRA #{String(lightboxIndex + 1).padStart(2, "0")} DE {photos.length}
              </span>
              <p className="text-sm font-mono text-gray-300">{photos[lightboxIndex].filename}</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleSelection(photos[lightboxIndex].id)}
                className={`flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-widest font-mono font-bold transition-all rounded-full ${
                  selectedPhotos.includes(photos[lightboxIndex].id)
                    ? "bg-primary text-black shadow-[0_0_25px_rgba(212,175,55,0.6)]"
                    : "bg-white/10 hover:bg-white hover:text-black text-white border border-white/20"
                }`}
              >
                <Heart className={`w-4 h-4 ${selectedPhotos.includes(photos[lightboxIndex].id) ? "fill-black" : ""}`} />
                {selectedPhotos.includes(photos[lightboxIndex].id) ? "Obra Selecionada" : "Selecionar Obra"}
              </button>

              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Artwork with Navigation Controls */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 flex items-center justify-center py-4 overflow-hidden"
          >
            {/* Prev Button */}
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1))
              }
              className="absolute left-4 z-30 p-3 bg-black/60 hover:bg-primary hover:text-black text-white rounded-full transition-colors border border-white/10"
              title="Obra Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Fullscreen Photo */}
            <img
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].filename}
              className="max-h-[75vh] max-w-[90vw] object-contain shadow-2xl animate-in zoom-in-95 duration-300"
            />

            {/* Next Button */}
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0))
              }
              className="absolute right-4 z-30 p-3 bg-black/60 hover:bg-primary hover:text-black text-white rounded-full transition-colors border border-white/10"
              title="Próxima Obra"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Bottom Instruction */}
          <div className="text-center text-gray-500 text-[11px] font-mono uppercase tracking-widest">
            Use as setas ← → do teclado para navegar • Pressione ESC para fechar
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 💎 FLOATING LUXURY CURATION BAR (RODAPÉ FLUTUANTE) */}
      {/* ============================================================ */}
      <div className="fixed bottom-6 inset-x-0 z-40 px-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-[#0d0d0d]/95 backdrop-blur-xl border border-border/80 px-6 md:px-10 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-full flex items-center justify-between gap-6 md:gap-12 max-w-3xl w-full">
          
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary block">
              STATUS DA CURADORIA
            </span>
            <div className="flex items-center gap-3">
              <span className="text-white font-serif text-lg md:text-xl">
                <strong className={selectedCount > included ? "text-primary" : "text-white"}>
                  {selectedCount}
                </strong>{" "}
                de {included} fotos inclusas
              </span>
              {extrasCount > 0 && (
                <span className="bg-primary/20 border border-primary/40 text-primary text-xs font-mono px-2.5 py-0.5 rounded-full font-bold">
                  +{extrasCount} extras (R$ {extrasTotal},00)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleIntentSave}
            disabled={saving || photos.length === 0}
            className="flex items-center gap-3 bg-primary hover:bg-white text-black font-bold uppercase tracking-widest text-xs px-6 md:px-8 py-3.5 rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.3)] shrink-0 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {saving
                ? "Salvando..."
                : extrasCount > 0
                ? "Concluir com Fotos Extras"
                : "Salvar Seleção de Obras"}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 💳 CHECKOUT MODAL DE FOTOS EXTRAS */}
      {/* ============================================================ */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-border w-full max-w-md p-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <h2 className="text-2xl font-serif text-white mb-2">Finalizar Obras Extras</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              O seu pacote inclui <strong>{included} obras</strong>, e você selecionou <strong>{selectedCount}</strong>.<br />
              O valor das <strong>{extrasCount} imagens excedentes</strong> é de:
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
                onClick={() => handleFinalizeDataAndNotify("pix")}
                disabled={saving}
                className="w-full bg-primary text-black font-bold py-3 text-xs uppercase tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Já fiz o PIX - Enviar ao WhatsApp
              </button>

              <button
                onClick={() => handleFinalizeDataAndNotify("cartao")}
                disabled={saving}
                className="w-full bg-transparent border border-border text-white font-bold py-3 text-xs uppercase tracking-widest hover:border-white transition-colors flex justify-center items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Pagar com Cartão (Até 10x Sem Juros)
              </button>

              <button
                onClick={() => setShowCheckoutModal(false)}
                className="w-full text-center text-gray-500 hover:text-white text-xs uppercase tracking-widest pt-2 transition-colors"
              >
                Voltar e revisar obras
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ✨ SUCCESS POPUP */}
      {/* ============================================================ */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-border max-w-md p-10 text-center animate-in zoom-in duration-300 relative">
            <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-primary fill-primary" />
            </div>
            <h2 className="text-3xl font-serif text-white mb-4">Curadoria Salva!</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              O seu pagamento foi processado com sucesso. Muito obrigado por expandir suas memórias conosco.<br /><br />
              <span className="text-white">
                O fotógrafo foi notificado e suas obras em alta resolução estarão disponíveis para download na sua pasta em <strong>até 7 dias úteis</strong>.
              </span>
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-primary text-black font-bold uppercase tracking-widest text-xs px-8 py-4 w-full hover:bg-white transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function GalleryView() {
  return (
    <Suspense fallback={<div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <GalleryViewContent />
    </Suspense>
  );
}
