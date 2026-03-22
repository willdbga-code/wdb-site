"use client";

import Link from "next/link";
import { Users, LayoutDashboard, Folders, MessageSquare, Settings, LogOut, ImageIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard"); // Restrict to admin only
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary tracking-widest text-xs uppercase animate-pulse">Verificando Permissões...</span>
      </div>
    );
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative z-[100]">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 bg-surface border-r border-border md:min-h-screen p-6 flex flex-col justify-between">
        <div>
          <Link href="/admin" className="block mb-12 hidden md:block">
             <h2 className="text-xl font-serif text-white tracking-widest uppercase mb-1">Admin</h2>
             <span className="text-primary text-[10px] uppercase tracking-widest">Painel de Controle</span>
          </Link>
          <nav className="space-y-4">
            <Link href="/admin" className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Resumo
            </Link>
            <Link href="/admin/galleries" className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <Folders className="w-4 h-4" /> Galerias
            </Link>
            <Link href="/admin/portfolio" className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <ImageIcon className="w-4 h-4" /> Portfólio Público
            </Link>
            <Link href="/admin/clients" className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <Users className="w-4 h-4" /> CRM
            </Link>
            <Link href="/admin/inbox" className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" /> Inbox & IA
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" /> Aparência
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
