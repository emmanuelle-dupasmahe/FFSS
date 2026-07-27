"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  Users,
  Globe,
  Settings,
  Mail
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Protection de la route
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") redirect("/login");
    if (status === "authenticated" && session?.user?.role !== "ADMIN") redirect("/profile");
  }, [session, status]);

  if (status === "loading") return <div className="min-h-screen bg-[#001A3D] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div></div>;

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'DPS', href: '/admin/devis-dps', icon: ShieldCheck }, // 🛡️ Plus logique pour le secours
    { name: 'Inscriptions', href: '/admin/inscriptions', icon: GraduationCap },
    { name: 'Membres', href: '/admin/users', icon: Users }, // 👥 Accès direct aux utilisateurs
    { name: 'Mailing', href: '/admin/mailing', icon: Mail },
  ];

  return (
   
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">

      {/* 🔝 NAVBAR HAUTE : Utilisation de bg-background/80 et border-border */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-12">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <span className="font-black italic text-xl text-white">A</span>
              </div>
              <h1 className="hidden sm:block text-lg font-black italic uppercase tracking-tighter text-foreground">
                ASSTSF <span className="text-blue-500">ADMIN</span>
              </h1>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${pathname === item.href
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  <item.icon size={14} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:opacity-80">
              <Globe size={14} /> Site Public
            </Link>

            <div className="flex items-center gap-3 pl-6 border-l border-border">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center font-black text-blue-500 text-xs">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <button className="lg:hidden p-2 text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 📱 MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[73px] z-50 bg-background p-6 flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-bold italic uppercase tracking-tight text-sm text-foreground">
              <item.icon size={20} className="text-blue-500" /> {item.name}
            </Link>
          ))}
        </div>
      )}

      {/* 🏢 CONTENU CENTRAL */}
      <main className="max-w-7xl mx-auto p-4 md:p-12">
        {children}
      </main>
    </div>
  );
}