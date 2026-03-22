"use client";

import Link from "next/link";
import { User, Image as ImageIcon, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary tracking-widest text-xs uppercase animate-pulse">Autenticando...</span>
      </div>
    );
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative z-[100]">
      {/* Sidebar minimalista */}
      <aside className="w-full md:w-64 bg-surface border-r border-border md:min-h-screen p-6 flex flex-col justify-between">
        <div>
          <Link href="/" className="block mb-12 hidden md:block">
             <h2 className="text-xl font-serif text-white tracking-widest uppercase mb-1">William</h2>
             <span className="text-primary italic font-serif lowercase text-lg">del</span> <span className="text-xl font-serif text-white tracking-widest uppercase">Barrio</span>
          </Link>
          <nav className="space-y-4">
            <Link href="/dashboard" className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <User className="w-4 h-4" /> Perfil
            </Link>
            <Link href="/dashboard/gallery" className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <ImageIcon className="w-4 h-4" /> Galerias
            </Link>
            <Link href="/dashboard/chat" className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" /> Mensagens
            </Link>
          </nav>
        </div>
        
        <button onClick={handleLogout} className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-500 hover:text-red-400 transition-colors mt-12 md:mt-0">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
