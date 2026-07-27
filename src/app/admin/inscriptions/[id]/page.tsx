import { prisma } from "@/lib/prisma";
import {
    ChevronLeft,
    Mail,
    Phone,
    MapPin,
    CheckCircle2,
    XCircle,
    User,
    Building2,
    MessageSquare,
    AlertCircle,
    Waves,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateInscriptionStatus } from "@/app/actions/formations";
import FinancePanel from "@/components/admin/FinancePanel";

export default async function InscriptionDetailPage({
    params
}: {
    params: Promise<{ id: string }> | { id: string }
}) {
    // 1. On "déballe" les paramètres
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) return notFound();

    // 2. Récupération des données (avec paiements inclus pour le FinancePanel)
    const ins = await prisma.inscription.findUnique({
        where: { id: id },
        include: { 
            formation: true, 
            user: true,
            paiements: { orderBy: { createdAt: "desc" } } 
        }
    });

    if (!ins) return notFound();

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* BOUTON RETOUR */}
            <Button asChild variant="ghost" className="text-slate-400 hover:text-white -ml-4">
                <Link href="/admin/inscriptions">
                    <ChevronLeft size={16} className="mr-2" /> Retour à la liste
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLONNE GAUCHE : INFOS CANDIDAT & MESSAGE */}
                <div className="lg:col-span-2 space-y-8 sticky top-18 self-start">
                    {/* CARTE PRINCIPALE */}
                    <section className="bg-[#00122e]/50 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <GraduationCap size={150} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ins.typeDemande === "STRUCTURE" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}`}>
                                    Demande {ins.typeDemande}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    Statut : {ins.status}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-tight">
                                {ins.formation.title}
                            </h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                        {ins.user.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Candidat / Référent</p>
                                        <p className="text-lg font-bold text-white">{ins.user.name}</p>
                                    </div>
                                </div>
                                {ins.structureName && (
                                    <div className="flex items-center gap-4 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-orange-500/50 tracking-widest">Structure</p>
                                            <p className="text-lg font-bold text-white">{ins.structureName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* MESSAGE & PRÉCISIONS */}
                    <section className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <MessageSquare className="text-blue-500" size={20} />
                            <h2 className="font-black uppercase text-xs tracking-[0.2em]">Précisions du candidat</h2>
                        </div>
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                            <p className="text-slate-300 leading-relaxed italic font-light whitespace-pre-wrap text-sm">
                                {ins.message ? `"${ins.message}"` : "Aucun message complémentaire n'a été laissé."}
                            </p>
                        </div>
                    </section>
                </div>

                {/* COLONNE DROITE : NIVEAU, PREREQUIS, FINANCES & ACTIONS */}
                <div className="space-y-8">
                    <section className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-4">
                        <h2 className="font-black uppercase text-xs tracking-[0.2em] text-slate-500 border-l-2 border-blue-500 pl-4">Niveau Technique</h2>
                        <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <Waves className="text-blue-400" size={24} />
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-400/70 tracking-widest">Aisance aquatique</p>
                                <p className="text-sm font-bold text-white">
                                    {ins.swimLevel === "CLUB" ? "🏊 Nageur en Club" :
                                        ins.swimLevel === "REGULIER" ? "🌊 Nageur Régulier" :
                                            "🔰 Débutant"}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <h2 className="font-black uppercase text-xs tracking-[0.2em] text-slate-500 border-l-2 border-emerald-500 pl-4">Dossier de Formation</h2>
                        <div className="space-y-4">
                            <PrerequisRow label="BNSSA" active={ins.hasBNSSA} />
                            <PrerequisRow label="PSE 1" active={ins.hasPSE1} />
                            <PrerequisRow label="PSE 2" active={ins.hasPSE2} />
                        </div>
                    </section>

                    {/* 🆕 GESTION FINANCIÈRE INTÉGRÉE */}
                    <FinancePanel inscription={ins} />

                    <div className="grid grid-cols-1 gap-4">
                        <Button asChild className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all">
                            <Link href={`/admin/inscriptions/${ins.id}/devis`}>Générer le Devis</Link>
                        </Button>
                        <form action={async () => {
                            "use server";
                            await updateInscriptionStatus(ins.id, "REFUSE");
                        }}>
                            <Button type="submit" variant="outline" className="w-full h-14 border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-500 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all">
                                Refuser le dossier
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PrerequisRow({ label, active }: { label: string, active: boolean }) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-xl border ${active ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/5 text-slate-500"}`}>
            <span className="text-[11px] font-black uppercase tracking-tight">{label}</span>
            {active ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
        </div>
    );
}

function GraduationCap(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    )
}