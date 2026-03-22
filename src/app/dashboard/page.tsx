"use client";

import { useState, useEffect } from "react";
import { UserCircle, Upload, Save, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword } from "firebase/auth";
import { db, storage, auth } from "@/lib/firebase";

export default function DashboardHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    photoURL: ""
  });
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            full_name: data.full_name || "",
            phone: data.phone || "",
            photoURL: data.photoURL || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    setMessage("Fazendo upload da foto...");
    
    try {
      const storageRef = ref(storage, `profiles/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfile(prev => ({ ...prev, photoURL: url }));
      setMessage("Foto enviada. Guarde as alterações para fixar!");
    } catch (err) {
      setMessage("Erro ao fazer upload.");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");

    try {
      // Salvar dados no Firestore
      await setDoc(doc(db, "users", user.uid), {
        ...profile,
        updated_at: new Date().toISOString()
      }, { merge: true });

      // Se houver nova senha, atualizar no Auth
      if (newPassword && auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setNewPassword(""); // Limpar o campo após o sucesso
      }

      setMessage("Perfil atualizado com sucesso!");
    } catch (err: any) {
      console.error(err);
      setMessage("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-16">Carregando dados do perfil...</div>;

  return (
    <div className="p-8 md:p-16 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif text-white mb-2">Seu Perfil</h1>
      <p className="text-gray-400 font-light mb-12 text-sm tracking-wide">Gerencie suas informações pessoais e senha de acesso.</p>
      
      {message && (
        <div className="bg-surface border border-border p-4 mb-8 flex items-center gap-3 text-xs tracking-widest uppercase text-white">
           <CheckCircle2 className="w-4 h-4 text-primary" /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Upload de Foto */}
        <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-surface border border-border flex items-center justify-center mb-6 overflow-hidden">
                {profile.photoURL ? (
                    <img src={profile.photoURL} alt="Foto de Perfil" className="w-full h-full object-cover" />
                ) : (
                    <UserCircle className="w-20 h-20 text-gray-500" />
                )}
            </div>
            <label className="text-xs flex items-center gap-2 cursor-pointer tracking-widest uppercase text-primary hover:text-white transition-colors border-b border-primary pb-1">
                <Upload className="w-4 h-4" /> Alterar Foto
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
        </div>

        {/* Formulário de Dados */}
        <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">E-mail Cadastrado</label>
              <input 
                type="text" 
                value={user?.email || ""}
                disabled
                className="w-full bg-surface/50 border border-border/50 text-gray-500 px-4 py-3 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Nome Completo</label>
              <input 
                type="text" 
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                className="w-full bg-surface border border-border focus:border-primary text-white px-4 py-3 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Telefone</label>
              <input 
                type="tel" 
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full bg-surface border border-border focus:border-primary text-white px-4 py-3 outline-none transition-colors"
                placeholder="+55 11 99999-9999"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Nova Senha</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Deixe em branco para manter a atual"
                className="w-full bg-surface border border-border focus:border-primary text-white px-4 py-3 outline-none transition-colors"
              />
            </div>

            <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-white flex items-center gap-3 text-black hover:bg-primary hover:text-white px-8 py-4 text-xs font-medium tracking-widest uppercase transition-colors mt-8 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
        </div>
      </div>
    </div>
  );
}
