"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "site_config"));
        if (snap.exists() && snap.data().aboutImage) {
          setBgImage(snap.data().aboutImage);
        }
      } catch (err) {}
    }
    fetchSettings();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Save user profile with role client
      const setDocPromise = setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        full_name: name,
        email: email,
        role: "client",
        created_at: new Date().toISOString()
      });
      
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT_DB")), 5000));
      
      await Promise.race([setDocPromise, timeoutPromise]);

      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("E-mail já cadastrado.");
      } else if (err.message === "TIMEOUT_DB") {
        setError("O usuário foi criado, mas o Banco de Dados (Firestore) está offline ou não foi ativado no Painel do Firebase.");
      } else {
        setError("Ocorreu um erro ao criar a conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col lg:flex-row-reverse">
      {/* Imagem Cover */}
      <div className="hidden lg:block lg:w-1/2 relative bg-surface">
         {bgImage ? (
            <img 
               src={bgImage} 
               alt="Register Cover"
               className="w-full h-full object-cover grayscale-[50%] animate-in fade-in duration-1000"
            />
         ) : (
            <div className="absolute inset-0 bg-black/50" />
         )}
         <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 py-16">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-16 uppercase tracking-widest text-xs transition-colors w-fit">
           <ArrowLeft className="w-4 h-4" />
           Voltar para Home
        </Link>
        
        <div className="max-w-md w-full mx-auto text-left">
          <h1 className="text-4xl font-serif text-white mb-2">Solicitar Acesso</h1>
          <p className="text-gray-400 font-light mb-12 text-sm tracking-wide">Crie sua conta para visualizar orçamentos e galerias.</p>

          <form className="space-y-6" onSubmit={handleRegister}>
            {error && <p className="text-red-500 text-xs uppercase tracking-widest">{error}</p>}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Nome Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-border focus:border-primary text-white px-4 py-3 outline-none transition-colors"
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-border focus:border-primary text-white px-4 py-3 outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border focus:border-primary text-white px-4 py-3 outline-none transition-colors"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-white text-black hover:bg-primary hover:text-white py-4 text-sm font-medium tracking-widest uppercase transition-colors mt-4 disabled:opacity-50">
              {loading ? "Criando..." : "Criar Conta"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Já possui uma conta?{" "}
              <Link href="/login" className="text-white hover:text-primary transition-colors">Fazer Login</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
