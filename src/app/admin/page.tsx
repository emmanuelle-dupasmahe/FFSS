import React from 'react';
import NoticeUtilisation from "@/components/admin/NoticeUtilisation";
import { prisma } from "@/lib/prisma";
import {
    Users,
    GraduationCap,
    ShieldCheck,
    Activity,
    ArrowUpRight,
    FileText,
    RefreshCw,
    Mail,
    Layout,
    Megaphone,
    Settings,
    LineChart
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
    const userCount = await prisma.user.count();
    const inscriptionsCount = await prisma.inscription.count({ where: { status: "EN_ATTENTE" } });
    const dpsCount = await prisma.devisDPS.count({ where: { status: "EN_ATTENTE" } });
    const recyclageCount = await prisma.inscription.count({ where: { needRecyclage: true, status: "EN_ATTENTE" } });

    // On va chercher le statut de l'alerte pour l'afficher dynamiquement sur la tuile !
    const currentAlert = await prisma.systemAlert.findUnique({ where: { id: "main-alert" } });

    // Récupération du compteur de visites
    const visitsRecord = await prisma.siteContent.findUnique({ where: { key: "global_visits" } });
    const totalVisits = visitsRecord ? parseInt(visitsRecord.value, 10) : 0;

    return (
        <div className="space-y-10">

            {/* 🔴 TITRE DASHBOARD */}
            <div className="text-center md:text-left pt-2 pb-8 border-b border-border">
                <h1 className="text-2xl md:text-3xl font-light text-foreground uppercase tracking-[0.2em] leading-tight">
                    Tableau de bord
                </h1>
                <p className="text-[10px] md:text-xs text-primary font-bold tracking-[0.3em] uppercase mt-3">
                    // GESTION CENTRALE // ASSTSF //
                </p>
                <div className="h-px w-10 bg-primary/30 mt-5 mx-auto md:mx-0"></div>
            </div>

            {/* 📊 INDICATEURS CLÉS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Visites" value={totalVisits} label="Vues uniques" icon={<LineChart size={20} />} color="purple" />
                <Link href="/admin/users">
                    <StatCard title="Membres" value={userCount} label="Utilisateurs" icon={<Users size={20} />} color="primary" />
                </Link>
                <Link href="/admin/inscriptions">
                    <StatCard title="Demandes Formations" value={inscriptionsCount} label="Inscriptions" icon={<GraduationCap size={20} />} color="emerald" />
                </Link>
                <Link href="/admin/devis-dps">
                    <StatCard title="Demandes DPS" value={dpsCount} label="Devis à traiter" icon={<FileText size={20} />} color="amber" />
                </Link>
                <Link href="/admin/inscriptions">
                    <StatCard title="Alertes Recyclages" value={recyclageCount} label="Recyclages" icon={<RefreshCw size={20} />} color="action" />
                </Link>
            </div>

            {/* 🎮 CENTRE DE PILOTAGE */}
            <div className="space-y-10">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Pôle Formations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <QuickTile href="/admin/formations" label="Gestion des Formations" subtitle="Editer les contenus" icon={<Layout className="text-blue-500" />} />
                        <QuickTile href="/admin/inscriptions" label="Dossiers Inscriptions" subtitle="Valider les stagiaires" icon={<GraduationCap className="text-emerald-500" />} />

                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Pôle DPS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <QuickTile href="/admin/devis-dps" label="Demandes Devis" subtitle="Analyse des risques RIS" icon={<FileText className="text-amber-500" />} />
                        <QuickTile href="/admin/catalogue-dps" label="Catalogue DPS" subtitle="Types de dispositifs" icon={<ShieldCheck className="text-blue-400" />} />

                    </div>
                </div>

                {/* ⚙️ COMMUNICATION, CONFIGURATION & DESIGN */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2">Communication & Paramètres</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickTile
                            href="/admin/mailing"
                            label="Mailing Ciblé"
                            subtitle="Communiquer par formation"
                            icon={<Mail className="text-blue-600" />}
                        />
                        <QuickTile
                            href="/admin/alerte"
                            label="Bandeau d'Annonce"
                            subtitle={currentAlert?.isActive ? "🔴 BANDEAU ACTIF EN LIGNE" : "⚪ AUCUNE ANNONCE EN COURS"}
                            icon={<Megaphone className={currentAlert?.isActive ? "text-red-500 animate-pulse" : "text-slate-400"} />}
                        />
                        <QuickTile href="/admin/templates" label="Mails Prédéfinis" subtitle="Templates de réponse généraux" icon={<Mail className="text-red-500" />} />
                        <QuickTile href="/admin/site" label="Design & Vitrine" subtitle="Carrousels & Slogans" icon={<Activity className="text-purple-500" />} />
                        <QuickTile href="/admin/settings" label="Paramètres du site" subtitle="Informations Footer et Navbar" icon={<Settings className="text-slate-600" />} />
                    </div>
                </div>
            </div>
            {/* 🚨 ZONE NOTICE D'UTILISATION INTEGRÉE EN BAS */}
            <div className="mt-16 pt-8 border-t-2 border-slate-200 dark:border-white/10">
                <NoticeUtilisation />
            </div>
        </div>
    );
}

/* --- COMPOSANTS INTERNES  --- */

function QuickTile({ href, label, subtitle, icon, disabled = false }: any) {
    return (
        <Link
            href={disabled ? "#" : href}
            className={`group relative p-6 bg-card border border-border rounded-3xl transition-all duration-300 
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary/40 hover:-translate-y-1 shadow-xl shadow-black/5'}`}
        >
            <div className="flex flex-col gap-4">
                <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">{icon}</div>
                <div>
                    <h4 className="font-light uppercase tracking-widest text-foreground text-sm">{label}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
                </div>
            </div>
            {!disabled && <ArrowUpRight className="absolute top-6 right-6 text-slate-400 group-hover:text-primary transition-colors" size={18} />}
        </Link>
    );
}

function StatCard({ title, value, label, icon, color }: any) {
    const colors: any = {
        primary: "text-blue-500 bg-blue-500/10",
        emerald: "text-emerald-500 bg-emerald-500/10",
        amber: "text-amber-500 bg-amber-500/10",
        action: "text-red-500 bg-red-500/10",
        purple: "text-purple-500 bg-purple-500/10"
    };
    return (
        <div className="p-6 bg-card border border-border rounded-3xl hover:border-primary/20 transition-all group shadow-sm shadow-black/5">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
                <span className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{value}</span>
            </div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</h3>
            <p className="text-[10px] text-slate-400 italic mt-1">{label}</p>
        </div>
    );
}