import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    User,
    GraduationCap,
    ShieldCheck,
    FileText,
    CalendarDays,
    ArrowRight,
    Mail,
    Phone,
    MapPin,
    Building2,
    ClipboardList,
    Fingerprint,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// 🚨 INSTRUCTION CRUCIALE ANTI-CACHE : Force la page à lire la BDD en direct
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const session = await auth();

    if (!session || !session.user?.email) {
        redirect("/login");
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            userType: true,
            phone: true,
            name: true,
            id: true,
            // 🆕 Champs Profil FFSS
            birthDate: true,
            birthPlace: true,
            address: true,
            zipCode: true,
            city: true,
            devisDPS: {
                select: {
                    id: true,
                    eventTitle: true,
                    status: true,
                    isSigned: true,
                    devisIsSigned: true
                }
            },
            // 🆕 Récupération des formations à signer
            inscriptions: {
                where: { isDevisSigned: false, status: { not: "REFUSE" } },
                select: {
                    id: true,
                    formation: { select: { title: true } }
                }
            }
        }
    });

    const userType = dbUser?.userType || "PARTICULIER";

    // 🟢 VÉRIFICATION DU PROFIL FFSS
    const isFFSSComplete = !!(dbUser?.birthDate && dbUser?.birthPlace && dbUser?.address && dbUser?.zipCode && dbUser?.city);

    // 🟢 GESTION DES ALERTES
    const devisList = dbUser?.devisDPS || [];
    const conventionsA_Signer = devisList.filter(d => !d.isSigned);
    const devisA_Signer = devisList.filter(d => d.status === "TRAITE" && !d.devisIsSigned);
    const formationsA_Signer = dbUser?.inscriptions || [];

    const typeConfig = {
        PARTICULIER: { icon: User, label: "Compte Particulier", color: "text-blue-500 bg-blue-500/10" },
        STRUCTURE: { icon: Building2, label: "Structure / Établissement", color: "text-amber-500 bg-amber-500/10" },
        ORGANISATEUR: { icon: ClipboardList, label: "Organisateur de DPS", color: "text-purple-500 bg-purple-500/10" },
    }[userType as "PARTICULIER" | "STRUCTURE" | "ORGANISATEUR"] || { icon: User, label: "Membre", color: "text-slate-500 bg-slate-500/10" };

    const TypeIcon = typeConfig.icon;

    const stats = {
        formationsSuivies: 0,
        statutSecouriste: "Valide",
    };

    return (
        <div className="space-y-8 pb-16">

            {/* 1. Header de Bienvenue */}
            <div className="relative overflow-hidden bg-white dark:bg-[#001A3D] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-sm transition-colors duration-300">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${typeConfig.color} border border-current/20`}>
                            <TypeIcon size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{typeConfig.label}</span>
                        </div>
                        <h2 className="text-4xl font-light uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                            Bienvenue, <span className="text-primary font-black italic tracking-tighter">{dbUser?.name}</span>
                        </h2>
                        <div className="flex items-center gap-2 text-slate-400">
                            <Fingerprint size={12} />
                            <p className="text-[10px] font-mono tracking-widest opacity-60">ID-{dbUser?.id?.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>

                    <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] py-6 px-8 transition-all hover:-translate-y-1">
                        <Link href="/profile/editer">Modifier mon profil</Link>
                    </Button>
                </div>

                <div className="absolute -right-20 -bottom-20 opacity-[0.03] dark:opacity-[0.05] pointer-events-none text-primary">
                    <ShieldCheck size={350} strokeWidth={1} />
                </div>
            </div>

            {/* 2. SYSTÈME D'ALERTES POUR SIGNATURES EN ATTENTE */}
            {(conventionsA_Signer.length > 0 || devisA_Signer.length > 0 || formationsA_Signer.length > 0) && (
                <div className="space-y-4 p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-3xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-400 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        Actions requises sur vos dossiers
                    </h4>

                    <div className="flex flex-col gap-3">
                        {/* ALERTES DPS */}
                        {conventionsA_Signer.map(doc => (
                            <div key={`conv-${doc.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#001A3D] rounded-2xl border border-amber-200/50 shadow-sm">
                                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                    Le bloc <span className="text-blue-600 font-black uppercase text-[10px] tracking-widest px-1">RIS & Convention</span> pour l'événement <span className="italic">"{doc.eventTitle}"</span> est prêt à être validé.
                                </p>
                                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[10px] tracking-wider h-10 px-6 shrink-0 shadow-md">
                                    <Link href={`/profile/conventions/${doc.id}`}>Lire et signer</Link>
                                </Button>
                            </div>
                        ))}

                        {devisA_Signer.map(doc => (
                            <div key={`dev-${doc.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#001A3D] rounded-2xl border border-amber-200/50 shadow-sm">
                                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                    Le <span className="text-emerald-600 font-black uppercase text-[10px] tracking-widest px-1">Devis Financier</span> pour l'événement <span className="italic">"{doc.eventTitle}"</span> est disponible.
                                </p>
                                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-wider h-10 px-6 shrink-0 shadow-md">
                                    <Link href={`/profile/devis/${doc.id}`}>Vérifier et signer</Link>
                                </Button>
                            </div>
                        ))}

                        {/* 🆕 ALERTES FORMATIONS */}
                        {formationsA_Signer.map(doc => (
                            <div key={`form-${doc.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#001A3D] rounded-2xl border border-amber-200/50 shadow-sm">
                                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                    Le <span className="text-primary font-black uppercase text-[10px] tracking-widest px-1">Devis de Formation</span> pour <span className="italic">"{doc.formation.title}"</span> est en attente de signature.
                                </p>
                                <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase text-[10px] tracking-wider h-10 px-6 shrink-0 shadow-md">
                                    <Link href={`/profile/inscriptions/${doc.id}`}>Compléter & Signer</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Grille de Statistiques Adaptative (Inchiffrée pour la lisibilité) */}
            {userType === "ORGANISATEUR" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <ClipboardList size={24} />
                            </div>
                            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-purple-600 transition-colors">
                                {devisList.length}
                            </span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Historique</h3>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Demandes de DPS</p>
                    </div>

                    <div className="group p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <ShieldCheck size={24} />
                            </div>
                            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-emerald-600 transition-colors">
                                {devisList.filter(d => d.isSigned).length}
                            </span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Activité</h3>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Dispositifs validés</p>
                    </div>

                    <div className="group p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-white/10 rounded-xl text-slate-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                <CalendarDays size={24} />
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-2 truncate max-w-full">
                                {devisList.find(d => d.status === "TRAITE")?.eventTitle || "--"}
                            </span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Prochainement</h3>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Prochain événement</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 group-hover:bg-primary group-hover:text-white transition-all">
                                <GraduationCap size={24} />
                            </div>
                            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary transition-colors">
                                {stats.formationsSuivies}
                            </span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Parcours</h3>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Formations suivies</p>
                    </div>

                    <div className={`group p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${stats.statutSecouriste === "Valide" ? 'hover:border-emerald-500/50' : 'hover:border-red-500/50'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl transition-all ${stats.statutSecouriste === "Valide" ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500'} group-hover:text-white`}>
                                <ShieldCheck size={24} />
                            </div>
                            <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${stats.statutSecouriste === "Valide" ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                {stats.statutSecouriste}
                            </span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Engagement</h3>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Statut de secouriste</p>
                    </div>

                    <div className="group p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-white/10 rounded-xl text-slate-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                <FileText size={24} />
                            </div>
                            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary transition-colors">
                                --
                            </span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Ressources</h3>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Documents à télécharger</p>
                    </div>
                </div>
            )}

            {/* 4. Section Infos Profil & Actions Rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-8 bg-white dark:bg-[#001A3D] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white border-b border-primary/20 pb-4 mb-8">
                        Dossier de <span className="text-primary italic">{userType}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 text-sm">
                        <InfoItem icon={User} label="Identité" value={dbUser?.name} />
                        <InfoItem icon={Mail} label="Contact Email" value={session.user?.email} />
                        <InfoItem icon={Phone} label="Contact Téléphonique" value={dbUser?.phone || "Non renseigné"} />
                        <InfoItem icon={TypeIcon} label="Catégorie de compte" value={typeConfig.label} />

                        {/* 🆕 AFFICHAGE DU STATUT FFSS UNIQUEMENT POUR LES NON-ORGANISATEURS */}
                        {userType !== "ORGANISATEUR" && (
                            <InfoItem
                                icon={isFFSSComplete ? CheckCircle2 : AlertCircle}
                                label="Dossier Licence FFSS"
                                value={isFFSSComplete ? "Complet (Prêt)" : "Incomplet (Adresse/Naissance requises)"}
                                isWarning={!isFFSSComplete}
                            />
                        )}
                    </div>
                </div>

                <div className="p-8 bg-white dark:bg-[#001A3D] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5 transition-colors duration-300">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
                        Accès Rapides
                    </h3>
                    <div className="flex flex-col gap-3">
                        {userType !== "ORGANISATEUR" && (
                            <ActionButton href="/formations" icon={GraduationCap} label="Catalogue formations" />
                        )}
                        <ActionButton href="/profile/attestations" icon={FileText} label="Mes documents" />
                        {userType === "STRUCTURE" && (
                            <ActionButton href="/formations/devis" icon={Building2} label="Demander un devis groupe" />
                        )}
                        {userType === "ORGANISATEUR" && (
                            <ActionButton href="/dps/nouvelle-demande" icon={ClipboardList} label="Demander un DPS" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value, isWarning }: { icon: any, label: string, value: string | undefined | null, isWarning?: boolean }) {
    return (
        <div className="flex items-start gap-3 group">
            <div className={`p-2 rounded-lg transition-colors ${isWarning ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-50 dark:bg-white/5 group-hover:bg-primary/10'}`}>
                <Icon size={16} className={`${isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-primary opacity-60 group-hover:opacity-100'} transition-opacity`} />
            </div>
            <div className="space-y-0.5 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className={`font-bold truncate transition-colors ${isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-primary'}`}>
                    {value || "--"}
                </p>
            </div>
        </div>
    );
}

function ActionButton({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Button asChild variant="outline" className="w-full h-14 border-slate-200 dark:border-white/10 justify-start hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-white/5 transition-all group rounded-2xl">
            <Link href={href} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-primary transition-all">
                    <Icon size={16} className="text-primary group-hover:text-primary dark:group-hover:text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="flex-1 text-left text-[11px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{label}</span>
                <ArrowRight size={14} className="text-slate-300 dark:text-white/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
            </Link>
        </Button>
    );
}