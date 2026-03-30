"use client";

import Link from "next/link";
import { Users, LayoutDashboard, Folders, MessageSquare, Settings, LogOut, ImageIcon, Menu, X, HardDrive, Package } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* Top Header Celular */}
      <div className="md:hidden w-full h-20 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 relative z-50">
         <Link href="/admin" onClick={() => setMenuOpen(false)}>
            <h2 className="text-xl font-serif text-white tracking-widest uppercase">Admin</h2>
         </Link>
         <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-2">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* Sidebar Admin */}
      <aside className={`${menuOpen ? 'flex fixed inset-0 top-20 bottom-0 bg-background/95 backdrop-blur-md pb-24' : 'hidden md:flex'} w-full md:w-64 md:bg-surface md:border-r md:border-border md:min-h-screen p-6 md:p-6 flex-col justify-between overflow-y-auto z-40`}>
        <div>
          <Link href="/admin" className="block mb-12 hidden md:block">
             <h2 className="text-xl font-serif text-white tracking-widest uppercase mb-1">Admin</h2>
             <span className="text-primary text-[10px] uppercase tracking-widest">Painel de Controle</span>
          </Link>
          <nav className="space-y-4">
             <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Resumo
             </Link>
            <Link href="/admin/galleries" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <Folders className="w-4 h-4" /> Galerias
            </Link>
            <Link href="/admin/deliveries" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <Package className="w-4 h-4" /> Entregas Finais
            </Link>
            <Link href="/admin/portfolio" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <ImageIcon className="w-4 h-4" /> Portfólio Público
            </Link>
            <Link href="/admin/clients" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <Users className="w-4 h-4" /> CRM
            </Link>
            <Link href="/admin/inbox" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" /> Inbox & IA
            </Link>
            <Link href="/admin/storage" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
              <HardDrive className="w-4 h-4" /> Armazenamento
            </Link>
            <Link href="/admin/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors">
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
         {(!menuOpen) && children}
      </main>
    </div>
  );
}
