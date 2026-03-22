"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      if (email.toLowerCase().trim() === "willdbga@gmail.com") {
         router.push("/admin");
      } else {
         router.push("/dashboard");
      }
    } catch (err: any) {
      setError("Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Imagem Cover */}
      <div className="hidden lg:block lg:w-1/2 relative bg-surface">
         {bgImage ? (
            <img 
               src={bgImage} 
               alt="Login Cover"
               className="w-full h-full object-cover grayscale-[50%] animate-in fade-in duration-1000"
            />
         ) : (
            <div className="absolute inset-0 bg-black/50" />
         )}
         <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 py-16">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-16 uppercase tracking-widest text-xs transition-colors w-fit">
           <ArrowLeft className="w-4 h-4" />
           Voltar para Home
        </Link>
        
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-4xl font-serif text-white mb-2">Bem-vindo(a)</h1>
          <p className="text-gray-400 font-light mb-12 text-sm tracking-wide">Acesse sua área exclusiva para clientes.</p>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <p className="text-red-500 text-xs uppercase tracking-widest">{error}</p>}
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
                required
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-primary" />
                  <span>Lembrar-me</span>
               </label>
               <a href="#" className="hover:text-white transition-colors">Esqueci a senha</a>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-white text-black hover:bg-primary hover:text-white py-4 text-sm font-medium tracking-widest uppercase transition-colors mt-4 disabled:opacity-50">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Não possui uma conta?{" "}
              <Link href="/register" className="text-white hover:text-primary transition-colors">Solicite Acesso</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
