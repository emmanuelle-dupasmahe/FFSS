import { prisma } from "@/lib/prisma";
import {
    GraduationCap,
    Search,
    Eye,
    Users,
    Building,
    User,
    Mail,
    Phone,
    CreditCard,
    CalendarClock,
    RefreshCw,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteInscriptionButton from "@/components/admin/DeleteInscriptionButton";
import InscriptionStatusSelect from "@/components/admin/InscriptionStatusSelect";
import ExportFFSSButton from "@/components/admin/ExportFFSSButton";


export default async function InscriptionsAdminPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const resolvedParams = await searchParams;
    const query = resolvedParams.q || "";

    const formations = await prisma.formation.findMany({
        where: {
            ...(query ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { inscriptions: { some: { user: { name: { contains: query, mode: 'insensitive' } } } } },
                    { inscriptions: { some: { structureName: { contains: query, mode: 'insensitive' } } } }
                ]
            } : {})
        },
        include: {
            inscriptions: {
                include: { user: true, paiements: true, session: true },
                orderBy: { createdAt: "desc" }
            }
        },
        orderBy: { title: "asc" },
    });

    const totalInscriptions = formations.reduce((acc, f) => acc + f.inscriptions.length, 0);

    // 🆕 PRÉPARATION DES DONNÉES POUR LE TABLEUR EXCEL

    const exportData = formations.flatMap(f =>
        f.inscriptions
            .filter(ins => ins.typeDemande !== "STRUCTURE" && ins.user)
            .map(ins => ({
                user: ins.user,
                formation: f // On garde l'objet formation ici
            }))
    ).filter(item => item.user && item.user.birthDate && item.user.address);

    // On supprime les doublons basés sur l'ID utilisateur
    const uniqueFfssUsers = Array.from(new Map(exportData.map(item => [item.user.id, item])).values());

    async function handleSearch(formData: FormData) {
        "use server";
        const searchTerm = formData.get("search") as string;
        redirect(searchTerm ? `/admin/inscriptions?q=${searchTerm}` : "/admin/inscriptions");
    }

    return (
        <div className="space-y-10 pb-10">
            {/* HEADER */}
            <div className="flex flex-col gap-8 border-b border-border pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
                            <GraduationCap className="text-primary" size={32} />
                            Listes d'Émargement
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                {totalInscriptions} dossier(s) en cours
                            </p>
                        </div>
                    </div>

                    {/* 🆕 LE BOUTON D'EXPORTATION EXCEL */}
                    <ExportFFSSButton data={uniqueFfssUsers} />
                </div>

                <form action={handleSearch} className="relative max-w-md group">
                    <Input
                        name="search"
                        placeholder="Rechercher un candidat ou une formation..."
                        defaultValue={query}
                        className="pl-12 h-14 bg-card border-border rounded-2xl focus:ring-primary transition-all text-foreground"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl text-[10px] uppercase font-black px-4">
                        Filtrer
                    </Button>
                </form>
            </div>

            {/* LISTE PAR FORMATION */}
            <div className="space-y-8">
                {formations.map((f) => {
                    if (f.inscriptions.length === 0) return null;

                    const totalParticipants = f.inscriptions.reduce((total, ins) => total + (ins.expectedParticipants || 1), 0);

                    return (
                        <div key={f.id} className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-border flex justify-between items-center flex-wrap gap-4">
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground flex items-center gap-3">
                                    {f.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 flex items-center gap-2">
                                        <Users size={14} /> {f.inscriptions.length} Dossier(s) / {totalParticipants} Personne(s)
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-border text-[9px] uppercase text-slate-500 font-black tracking-widest">
                                            <th className="p-4 pl-6">Candidat / Structure</th>
                                            <th className="p-4">Contact & Licence FFSS</th>
                                            <th className="p-4">Dossier Administratif</th>
                                            <th className="p-4 border-l border-dashed border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-500 relative">
                                                Suivi Financier (Prévu)
                                            </th>
                                            <th className="p-4 text-right pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border text-sm">
                                        {f.inscriptions.map((ins) => {
                                            const u = ins.user;
                                            const hasFFSS = !!(u?.birthDate && u?.birthPlace && u?.address && u?.zipCode && u?.city);

                                            return (
                                                <tr key={ins.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">

                                                    {/* COLONNE 1 : CANDIDAT */}
                                                    <td className="p-4 pl-6 align-top">
                                                        <div className="flex items-start gap-3">
                                                            {ins.typeDemande === "STRUCTURE" ? (
                                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                                                                    <Building size={16} />
                                                                </div>
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                                    <User size={16} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-bold text-foreground uppercase text-sm leading-tight">
                                                                    {ins.typeDemande === "STRUCTURE" ? ins.structureName : u?.name || "Sans nom"}
                                                                </p>
                                                                {ins.needRecyclage ? (
                                                                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                                                                        <RefreshCw size={10} /> Recyclage
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-block mt-1 text-[9px] font-bold text-slate-500 uppercase">
                                                                        Initial
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* COLONNE 2 : CONTACT & STATUT FFSS (Simplifié) */}
                                                    <td className="p-4 align-top">
                                                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                                                            <div className="flex items-center gap-2 select-all">
                                                                <Mail size={12} className="opacity-50 shrink-0" />
                                                                {u?.email || "—"}
                                                            </div>
                                                            <div className="flex items-center gap-2 select-all">
                                                                <Phone size={12} className="opacity-50 shrink-0" />
                                                                {u?.phone || "—"}
                                                            </div>

                                                            {ins.typeDemande !== "STRUCTURE" && (
                                                                <div className="pt-1">
                                                                    {hasFFSS ? (
                                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                                                                            <CheckCircle2 size={12} /> Dossier FFSS Complet
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-500/10 px-2 py-1 rounded-lg">
                                                                            <XCircle size={12} /> Licence non renseignée
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* COLONNE 3 : DOSSIER ADMINISTRATIF */}
                                                    <td className="p-4 align-top">
                                                        <div className="space-y-2">
                                                            <InscriptionStatusSelect id={ins.id} currentStatus={ins.status} />
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                                                                Places : <span className="text-foreground">{ins.expectedParticipants}</span>
                                                            </p>
                                                            {/* 🆕 AFFICHAGE DE LA DATE CHOISIE */}
                                                            {ins.session?.startDate ? (
                                                                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 mt-1">
                                                                    <CalendarClock size={12} />
                                                                    {new Date(ins.session.startDate).toLocaleDateString()}
                                                                </div>
                                                            ) : (
                                                                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-500/10 px-2 py-1 rounded-lg mt-1">
                                                                    <CalendarClock size={12} />
                                                                    Pas de date
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>


                                                    {/* COLONNE 4 : SUIVI FINANCIER DYNAMIQUE */}
                                                    <td className="p-4 align-top border-l border-dashed border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10">
                                                        {(() => {
                                                            // Calculs automatiques
                                                            const prixTotal = ins.prixTotal || 0;
                                                            const totalPaye = ins.paiements.reduce((sum, p) => sum + p.montant, 0);
                                                            const resteAPayer = prixTotal - totalPaye;
                                                            const estSolde = resteAPayer <= 0 && prixTotal > 0;

                                                            return (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <CreditCard size={14} className={estSolde ? "text-emerald-500" : "text-amber-600"} />
                                                                        <span className={`text-[10px] font-black uppercase ${estSolde ? "text-emerald-600" : "text-amber-600"}`}>
                                                                            {prixTotal === 0 ? "Non défini" : (estSolde ? "Soldé" : `Reste : ${resteAPayer.toFixed(2)} €`)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between gap-2 bg-white dark:bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-white/5">
                                                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Total : {prixTotal.toFixed(2)} €</span>
                                                                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                                                                            Total : {prixTotal > 0 ? `${prixTotal.toFixed(2)} €` : "—"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>

                                                    {/* COLONNE 5 : ACTIONS */}
                                                    <td className="p-4 align-top text-right pr-6">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/admin/inscriptions/${ins.id}`}>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-primary hover:text-white transition-all">
                                                                    <Eye size={16} />
                                                                </Button>
                                                            </Link>
                                                            <DeleteInscriptionButton id={ins.id} />
                                                        </div>
                                                    </td>

                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}

                {formations.every(f => f.inscriptions.length === 0) && (
                    <div className="text-center py-20 bg-card rounded-[2rem] border border-border">
                        <Users className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-medium">Aucun dossier d'inscription pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
