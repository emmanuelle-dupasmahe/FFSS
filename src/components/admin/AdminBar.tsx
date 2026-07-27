"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, GraduationCap, Users, Settings, Globe } from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Formations', href: '/admin/formations', icon: GraduationCap },
    { name: 'Inscriptions', href: '/admin/inscriptions', icon: Users },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="w-64 bg-[#001A3D] text-white min-h-screen p-6 space-y-8 flex-shrink-0">
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">A</div>
                <span className="font-black tracking-tighter uppercase text-lg">ASSTSF Admin</span>
            </div>

            <div className="space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="pt-8 mt-8 border-t border-white/10">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-400/10 transition-all"
                >
                    <Globe size={18} />
                    Voir le site public
                </Link>
            </div>
        </nav>
    );
}