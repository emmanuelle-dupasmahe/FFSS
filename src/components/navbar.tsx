"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Menu,
    X,
    Moon,
    Sun,
    ChevronDown,
    LayoutDashboard,
    User,
    LogOut,
    UserCircle,
    BookOpen
} from "lucide-react";

export default function Navbar({ navCategories }: { navCategories?: { name: string, href: string }[] }) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
    };

    const defaultCategories = [
        { name: "Secourisme (GQS, PSC, PSE1, PSE2)", href: "/formations#secourisme" },
        { name: "Sauvetage Aquatique (BNSSA, SSA Littoral option PES)", href: "/formations#aquatique" },
        { name: "Recyclages", href: "/formations#recyclages" },
    ];

    const formationCategories = navCategories && navCategories.length > 0 ? navCategories : defaultCategories;

    const isAdmin = session?.user?.role === "ADMIN";
    const dashboardUrl = isAdmin ? "/admin" : "/profile";
    const dashboardLabel = isAdmin ? "Administration" : "Mon Espace";

    const navLinkStyle = "text-xs font-light tracking-[0.2em] uppercase text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all duration-300";

    return (
        <nav className="sticky top-0 [[data-has-banner=true]_&]:top-[44px] z-[100] w-full border-b border-white/10 bg-background/80 backdrop-blur-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-20 h-20 animate-pulse transition-transform hover:scale-105 duration-500">
                            <Image
                                src="/log_asstsf.png"
                                alt="Logo ASSTSF"
                                fill
                                sizes="(max-width: 768px) 80px, 100px"
                                className="object-contain drop-shadow-[0_0_10px_rgba(0,102,204,0.3)]"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Navigation Desktop */}
                    <div className="hidden md:flex items-center gap-8">

                        <Link href="/services/dps" className={navLinkStyle}>DPS</Link>

                        <div
                            className="relative"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <button className={`flex items-center gap-1 outline-none py-4 ${navLinkStyle}`}>
                                Formations
                                <ChevronDown size={12} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200">
                                    {formationCategories.map((cat) => (
                                        <Link
                                            key={cat.name}
                                            href={cat.href}
                                            className="block px-4 py-2 text-[10px] uppercase tracking-wider font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-colors"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                    <div className="border-t border-slate-100 dark:border-white/5 mt-1 pt-1">
                                        <Link href="/formations" className="block px-4 py-2 text-[10px] uppercase tracking-widest font-black text-primary">
                                            Voir toutes les formations
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors">
                            <Sun size={18} className="hidden dark:block text-secondary" />
                            <Moon size={18} className="block dark:hidden" />
                        </button>

                        {/* SECTION UTILISATEUR DESKTOP */}
                        {session ? (
                            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-400">Connecté</span>
                                    <span className="text-[10px] font-bold text-primary uppercase">{session.user?.name}</span>
                                </div>

                                {/* 👇 NOUVEAU BOUTON ESPACE STAGIAIRE DESKTOP */}
                                <Button asChild variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-[10px] uppercase tracking-[0.15em] font-bold shadow-sm px-4 gap-2">
                                    <Link href="/espace-stagiaire">
                                        <BookOpen size={14} />
                                        Espace Formation
                                    </Link>
                                </Button>

                                <Button asChild className="bg-primary hover:opacity-90 text-white text-[10px] uppercase tracking-[0.15em] font-bold shadow-sm px-4 gap-2">
                                    <Link href={dashboardUrl}>
                                        {isAdmin ? <LayoutDashboard size={14} /> : <UserCircle size={14} />}
                                        {dashboardLabel}
                                    </Link>
                                </Button>

                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Déconnexion"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Button asChild className="bg-primary hover:opacity-90 text-white text-[10px] uppercase tracking-[0.15em] font-bold shadow-sm px-6">
                                <Link href="/login">Connexion</Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-600 dark:text-slate-300">
                            <Moon size={22} className="block dark:hidden" />
                            <Sun size={22} className="hidden dark:block text-secondary" />
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-300 p-2">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Mobile */}
            {isOpen && (
                <div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-white/10 px-4 py-6 space-y-4 shadow-xl">
                    {session && (
                        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-white/5">
                            <UserCircle size={32} className="text-primary" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest text-slate-400">Session de</span>
                                <span className="text-sm font-bold uppercase">{session.user?.name}</span>
                            </div>
                        </div>
                    )}

                    {/* LIEN MODIFIÉ MOBILE */}
                    <Link href="/services/dps" onClick={() => setIsOpen(false)} className="block text-sm font-light tracking-[0.2em] uppercase">DPS</Link>

                    <div className="space-y-3 border-l-2 border-primary/20 pl-4 mt-2">
                        <p className="text-[10px] font-black uppercase text-slate-400">Nos Formations</p>
                        {formationCategories.map((cat) => (
                            <Link key={cat.name} href={cat.href} onClick={() => setIsOpen(false)} className="block text-xs font-light tracking-widest uppercase">
                                {cat.name}
                            </Link>
                        ))}
                    </div>

                    {session ? (
                        <div className="space-y-3 pt-4">
                            {/* 👇 NOUVEAU BOUTON ESPACE STAGIAIRE MOBILE */}
                            <Button asChild variant="outline" className="w-full border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold py-6 text-sm uppercase tracking-widest gap-2">
                                <Link href="/espace-stagiaire" onClick={() => setIsOpen(false)}>
                                    <BookOpen size={18} />
                                    Espace Formation
                                </Link>
                            </Button>

                            <Button asChild className="w-full bg-primary text-white font-bold py-6 text-sm uppercase tracking-widest gap-2">
                                <Link href={dashboardUrl} onClick={() => setIsOpen(false)}>
                                    {isAdmin ? <LayoutDashboard size={18} /> : <UserCircle size={18} />}
                                    {dashboardLabel}
                                </Link>
                            </Button>
                            <Button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                variant="outline"
                                className="w-full border-red-500/20 text-red-500 font-bold py-6 text-sm uppercase tracking-widest gap-2"
                            >
                                <LogOut size={18} />
                                Déconnexion
                            </Button>
                        </div>
                    ) : (
                        <Button asChild className="w-full bg-primary text-white font-bold py-6 text-sm uppercase tracking-widest">
                            <Link href="/login" onClick={() => setIsOpen(false)}>Connexion</Link>
                        </Button>
                    )}
                </div>
            )}
        </nav>
    );
}