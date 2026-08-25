"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToBlob, getPublicImageUrl } from "@/lib/blob";
import { compressImage } from "@/lib/compressImage";
import { Upload, Save, CheckCircle, Loader2, Mic, Volume2, Sparkles, Image as ImageIcon } from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"appearance" | "voice">("appearance");
  const [settings, setSettings] = useState({
    heroImage: "",
    aboutImage: "",
    signatureIcon: "",
    elevenLabsVoiceId: "bIHbv24MWmeRgasZH58o",
    whatsappAudioMode: "mirror", // "mirror" | "always" | "disabled"
    whatsappAudioEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Voice test state
  const [testText, setTestText] = useState("Olá! Aqui é o William Del Barrio. Seja muito bem-vindo ao nosso estúdio fine art.");
  const [testingVoice, setTestingVoice] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  const settingsRef = doc(db, "settings", "site_config");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          const data = snap.data();
          setSettings(prev => ({
            ...prev,
            ...data,
            elevenLabsVoiceId: data.elevenLabsVoiceId || prev.elevenLabsVoiceId,
            whatsappAudioMode: data.whatsappAudioMode || prev.whatsappAudioMode,
            whatsappAudioEnabled: data.whatsappAudioEnabled !== undefined ? data.whatsappAudioEnabled : prev.whatsappAudioEnabled,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "heroImage" | "aboutImage" | "signatureIcon") => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setMessage(`Otimizando e enviando ${file.name}...`);
    try {
      const fileToUpload =
        field === "signatureIcon"
          ? file
          : await compressImage(file, { maxWidth: field === "heroImage" ? 2560 : 1800, quality: 0.85 });

      const url = await uploadToBlob(fileToUpload, `settings/${field}`);
      setSettings(prev => ({ ...prev, [field]: url }));
      setMessage(`Upload completo para ${field}. Lembre-se de salvar.`);
    } catch (err: any) {
      console.error(err);
      setMessage(`Erro no upload: ${err.message || "Falha ao enviar arquivo."}`);
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

  const handleTestVoice = async () => {
    setTestingVoice(true);
    setMessage("");
    try {
      const resp = await fetch("/api/admin/voice-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: testText,
          voiceId: settings.elevenLabsVoiceId,
        }),
      });
      const data = await resp.json();
      if (data.dataUri) {
        setAudioPreviewUrl(data.dataUri);
        setMessage("Áudio gerado com sucesso! Clique no player para ouvir.");
      } else {
        setMessage(`Erro na geração: ${data.error || "Falha desconhecida"}`);
      }
    } catch (err: any) {
      setMessage(`Erro ao testar voz: ${err.message}`);
    } finally {
      setTestingVoice(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-white mb-2">Painel de Configurações</h1>
          <p className="text-gray-400 font-light">Gerencie a identidade visual e o motor de voz IA do estúdio.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-surface border border-border p-1 gap-1">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
              activeTab === "appearance" ? "bg-primary text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Aparência
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
              activeTab === "voice" ? "bg-primary text-black font-semibold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Áudio & Voz IA
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-surface border border-border p-4 mb-8 flex items-center gap-3 text-xs tracking-widest uppercase text-white">
          <CheckCircle className="w-4 h-4 text-primary" /> {message}
        </div>
      )}

      {/* ================= TAB 1: APARÊNCIA ================= */}
      {activeTab === "appearance" && (
        <div className="space-y-12 animate-in fade-in duration-300">
          {/* Hero Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-border/50 pb-12">
            <div>
              <h3 className="text-white text-lg font-serif mb-2">Imagem Principal (Hero)</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6 border-l border-primary pl-4">
                Recomendado: 1920x1080 (Desktop), Escura/Cinematográfica.
              </p>
              <label className="flex items-center gap-3 text-xs tracking-widest uppercase bg-surface hover:bg-white hover:text-black border border-border px-6 py-3 cursor-pointer transition-colors w-fit">
                <Upload className="w-4 h-4" /> Fazer Upload
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "heroImage")} />
              </label>
            </div>
            <div className="aspect-video bg-surface overflow-hidden flex items-center justify-center border border-border border-dashed">
              {settings.heroImage ? (
                <img src={getPublicImageUrl(settings.heroImage)} className="w-full h-full object-cover opacity-80" alt="Hero Preview" />
              ) : (
                <span className="text-gray-600 text-xs uppercase tracking-widest">Nenhuma Imagem</span>
              )}
            </div>
          </div>

          {/* About Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-border/50 pb-12">
            <div>
              <h3 className="text-white text-lg font-serif mb-2">Imagem de Perfil (Sobre)</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6 border-l border-primary pl-4">
                Recomendado: Proporção Retrato (3:4).
              </p>
              <label className="flex items-center gap-3 text-xs tracking-widest uppercase bg-surface hover:bg-white hover:text-black border border-border px-6 py-3 cursor-pointer transition-colors w-fit">
                <Upload className="w-4 h-4" /> Fazer Upload
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "aboutImage")} />
              </label>
            </div>
            <div className="aspect-[3/4] max-w-[250px] bg-surface overflow-hidden flex items-center justify-center border border-border border-dashed">
              {settings.aboutImage ? (
                <img src={getPublicImageUrl(settings.aboutImage)} className="w-full h-full object-cover opacity-80" alt="About Preview" />
              ) : (
                <span className="text-gray-600 text-xs uppercase tracking-widest">Nenhuma</span>
              )}
            </div>
          </div>

          {/* Signature Icon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-border/50 pb-12">
            <div>
              <h3 className="text-white text-lg font-serif mb-2">Ícone da Assinatura</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6 border-l border-primary pl-4">
                Recomendado: PNG com fundo transparente. Cor Branca/Preta.
              </p>
              <label className="flex items-center gap-3 text-xs tracking-widest uppercase bg-surface hover:bg-white hover:text-black border border-border px-6 py-3 cursor-pointer transition-colors w-fit">
                <Upload className="w-4 h-4" /> Fazer Upload
                <input type="file" className="hidden" accept="image/png, image/svg+xml" onChange={(e) => handleFileUpload(e, "signatureIcon")} />
              </label>
            </div>
            <div className="h-24 max-w-[250px] bg-surface overflow-hidden flex items-center justify-center border border-border border-dashed p-4">
              {settings.signatureIcon ? (
                <img src={getPublicImageUrl(settings.signatureIcon)} className="h-full object-contain invert opacity-80" alt="Signature Preview" />
              ) : (
                <span className="text-gray-600 text-[10px] uppercase tracking-widest text-center">
                  Nenhuma
                  <br />
                  (Usará a padrão)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: VOZ & ÁUDIO IA ================= */}
      {activeTab === "voice" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div className="bg-surface/60 border border-border p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-white font-serif text-lg">Motor ElevenLabs - Voz Clonada do William</h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">
              Quando ativado, a IA sintetiza a resposta com a sua entonação e timbre real, enviando como uma nota de voz gravada na hora no WhatsApp (PTT) com efeito de microfone verde.
            </p>
          </div>

          {/* Voice ID Configuration */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-widest text-gray-300">
              ElevenLabs Voice ID (Voz Clonada)
            </label>
            <input
              type="text"
              value={settings.elevenLabsVoiceId}
              onChange={(e) => setSettings({ ...settings, elevenLabsVoiceId: e.target.value })}
              placeholder="Ex: 2GipH0WdOpsTaVrk5RwE"
              className="w-full bg-surface border border-border focus:border-primary px-4 py-3 text-white text-sm outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-500">
              Você pode encontrar ou criar novas vozes no painel da sua conta no ElevenLabs.
            </p>
          </div>

          {/* Audio Mode Selection */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-widest text-gray-300">
              Modo de Resposta no WhatsApp
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setSettings({ ...settings, whatsappAudioMode: "mirror", whatsappAudioEnabled: true })}
                className={`p-5 border cursor-pointer transition-all ${
                  settings.whatsappAudioMode === "mirror" && settings.whatsappAudioEnabled
                    ? "bg-primary/10 border-primary text-white"
                    : "bg-surface border-border text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Modo Espelho</span>
                  <Volume2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  Se o cliente mandar áudio, a IA responde em áudio. Se mandar texto, responde em texto.
                </p>
              </div>

              <div
                onClick={() => setSettings({ ...settings, whatsappAudioMode: "always", whatsappAudioEnabled: true })}
                className={`p-5 border cursor-pointer transition-all ${
                  settings.whatsappAudioMode === "always" && settings.whatsappAudioEnabled
                    ? "bg-primary/10 border-primary text-white"
                    : "bg-surface border-border text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Sempre em Áudio</span>
                  <Mic className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  A IA enviará notas de voz para todas as mensagens recebidas, com links de apoio em texto.
                </p>
              </div>

              <div
                onClick={() => setSettings({ ...settings, whatsappAudioMode: "disabled", whatsappAudioEnabled: false })}
                className={`p-5 border cursor-pointer transition-all ${
                  !settings.whatsappAudioEnabled || settings.whatsappAudioMode === "disabled"
                    ? "bg-primary/10 border-primary text-white"
                    : "bg-surface border-border text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Apenas Texto</span>
                  <span className="text-xs text-gray-500">OFF</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  Desativa o envio de áudio e responde todas as mensagens exclusivamente por texto digitado.
                </p>
              </div>
            </div>
          </div>

          {/* Voice Tester Box */}
          <div className="border border-border bg-surface/40 p-6 space-y-4">
            <h4 className="text-sm font-serif text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" /> Testar Síntese Vocal
            </h4>
            <textarea
              rows={3}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Digite uma frase para testar a voz clonada..."
              className="w-full bg-black/40 border border-border focus:border-primary p-3 text-white text-xs outline-none resize-none"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={testingVoice || !testText.trim()}
                className="flex items-center gap-2 bg-white text-black hover:bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {testingVoice ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando Áudio...
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" /> Gerar Amostra
                  </>
                )}
              </button>

              {audioPreviewUrl && (
                <div className="w-full sm:w-auto flex-1 sm:max-w-xs">
                  <audio controls src={audioPreviewUrl} className="w-full h-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
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
