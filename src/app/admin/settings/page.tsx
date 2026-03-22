"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Upload, Save, CheckCircle, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    heroImage: "",
    aboutImage: "",
    signatureIcon: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const settingsRef = doc(db, "settings", "site_config");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          setSettings(snap.data() as any);
        }
      } catch (err) {
        console.error("Erro ao puxar settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof settings) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setMessage(`Fazendo upload de ${file.name}...`);
    try {
      const storageRef = ref(storage, `settings/${field}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSettings(prev => ({ ...prev, [field]: url }));
      setMessage(`Upload completo para ${field}. Lembre-se de salvar.`);
    } catch (err) {
      console.error(err);
      setMessage("Erro no upload.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await setDoc(settingsRef, settings, { merge: true });
      setMessage("Configurações salvas com sucesso!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl">
      <h1 className="text-3xl font-serif text-white mb-2">Aparência do Site</h1>
      <p className="text-gray-400 font-light mb-12">Altere as imagens globais da página inicial (Hero, Sobre, Assinatura).</p>

      {message && (
        <div className="bg-surface border border-border p-4 mb-8 flex items-center gap-3 text-xs tracking-widest uppercase text-white">
           <CheckCircle className="w-4 h-4 text-primary" /> {message}
        </div>
      )}

      <div className="space-y-12">
        {/* Hero Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-border/50 pb-12">
           <div>
              <h3 className="text-white text-lg font-serif mb-2">Imagem Principal (Hero)</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6 border-l border-primary pl-4">Recomendado: 1920x1080 (Desktop), Escura/Cinematográfica.</p>
              <label className="flex items-center gap-3 text-xs tracking-widest uppercase bg-surface hover:bg-white hover:text-black border border-border px-6 py-3 cursor-pointer transition-colors w-fit">
                 <Upload className="w-4 h-4" /> Fazer Upload
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'heroImage')} />
              </label>
           </div>
           <div className="aspect-video bg-surface overflow-hidden flex items-center justify-center border border-border border-dashed">
              {settings.heroImage ? (
                  <img src={settings.heroImage} className="w-full h-full object-cover opacity-80" alt="Hero Preview" />
              ) : (
                  <span className="text-gray-600 text-xs uppercase tracking-widest">Nenhuma Imagem</span>
              )}
           </div>
        </div>

        {/* About Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-border/50 pb-12">
           <div>
              <h3 className="text-white text-lg font-serif mb-2">Imagem de Perfil (Sobre)</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6 border-l border-primary pl-4">Recomendado: Proporção Retrato (3:4).</p>
              <label className="flex items-center gap-3 text-xs tracking-widest uppercase bg-surface hover:bg-white hover:text-black border border-border px-6 py-3 cursor-pointer transition-colors w-fit">
                 <Upload className="w-4 h-4" /> Fazer Upload
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'aboutImage')} />
              </label>
           </div>
           <div className="aspect-[3/4] max-w-[250px] bg-surface overflow-hidden flex items-center justify-center border border-border border-dashed">
              {settings.aboutImage ? (
                  <img src={settings.aboutImage} className="w-full h-full object-cover opacity-80" alt="About Preview" />
              ) : (
                  <span className="text-gray-600 text-xs uppercase tracking-widest">Nenhuma</span>
              )}
           </div>
        </div>

        {/* Signature Icon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-border/50 pb-12">
           <div>
              <h3 className="text-white text-lg font-serif mb-2">Ícone da Assinatura</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6 border-l border-primary pl-4">Recomendado: PNG com fundo transparente. Cor Branca/Preta.</p>
              <label className="flex items-center gap-3 text-xs tracking-widest uppercase bg-surface hover:bg-white hover:text-black border border-border px-6 py-3 cursor-pointer transition-colors w-fit">
                 <Upload className="w-4 h-4" /> Fazer Upload
                 <input type="file" className="hidden" accept="image/png, image/svg+xml" onChange={(e) => handleFileUpload(e, 'signatureIcon')} />
              </label>
           </div>
           <div className="h-24 max-w-[250px] bg-surface overflow-hidden flex items-center justify-center border border-border border-dashed p-4">
              {settings.signatureIcon ? (
                  <img src={settings.signatureIcon} className="h-full object-contain invert opacity-80" alt="Signature Preview" />
              ) : (
                  <span className="text-gray-600 text-[10px] uppercase tracking-widest text-center">Nenhuma<br/>(Usará a padrão)</span>
              )}
           </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end">
         <button 
           onClick={handleSave} 
           disabled={saving}
           className="flex items-center gap-3 bg-primary text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
         >
            <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Configurações"}
         </button>
      </div>
    </div>
  );
}
