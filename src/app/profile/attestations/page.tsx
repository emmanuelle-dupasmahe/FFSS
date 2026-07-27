import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FileText, GraduationCap, ShieldAlert, Download, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AttestationsPage() {
    const session = await auth();

    // 1. Vérification de l'authentification
    if (!session || !session.user?.email) {
        redirect("/login");
    }

    // 2. Récupération de l'utilisateur en base de données
    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!dbUser) {
        redirect("/login");
    }

    // 3. Récupération des formations avec devis signés
    const signedInscriptions = await prisma.inscription.findMany({
        where: {
            userId: dbUser.id,
            isDevisSigned: true,
        },
        include: {
            formation: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    // 4. Récupération des devis DPS validés de l'organisateur
    const signedDps = await prisma.devisDPS.findMany({
        where: {
            userId: dbUser.id,
            status: "TRAITE", // Correspond aux dossiers finalisés/acceptés
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    const hasDocuments = signedInscriptions.length > 0 || signedDps.length > 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4 md:px-0">
            {/* Bouton Retour */}
            <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-primary transition-colors"
            >
                <ArrowLeft size={16} /> Retour à mon espace
            </Link>

            {/* En-tête de la page */}
            <div className="border-b border-border pb-6">
                <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
                    <FileText className="text-primary" size={32} />
                    Mes <span className="text-primary font-black italic">Documents</span>
                </h2>
                <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest opacity-80">
                    Centralisation de vos attestations, contrats et devis signés
                </p>
            </div>

            {/* Contenu principal */}
            {!hasDocuments ? (
                <div className="text-center py-20 bg-card rounded-[2rem] border border-border space-y-4">
                    <FileText className="mx-auto text-slate-300 dark:text-slate-700" size={48} />
                    <p className="text-slate-500 text-sm font-medium">
                        Aucun document signé ou attestation n'est disponible pour le moment.
                    </p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* SECTION 1 : FORMATIONS (CANDIDATS) */}
                    {signedInscriptions.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                <GraduationCap size={16} /> Formations & Sauvetage
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                {signedInscriptions.map((ins) => (
                                    <div
                                        key={ins.id}
                                        className="p-6 bg-card border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow bg-white dark:bg-white/5"
                                    >
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/10">
                                                Dossier Validé
                                            </span>
                                            <h4 className="text-sm font-bold text-foreground mt-1">
                                                Devis Officiel - {ins.formation.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                                <Calendar size={12} /> Signé numériquement
                                            </p>
                                        </div>

                                        {ins.devisUrl && (
                                            <Button asChild variant="outline" className="h-11 rounded-xl text-xs font-bold border-border gap-2 shrink-0">
                                                <a
                                                    href={ins.devisUrl.replace('#toolbar=0', '')}
                                                    download={`Devis_Formation_${ins.id}.pdf`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Download size={14} /> Télécharger (PDF)
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 2 : POSTES DE SECOURS (DPS ORGANISATEURS) */}
                    {signedDps.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-600 dark:text-orange-400 flex items-center gap-2">
                                <ShieldAlert size={16} /> Dispositifs Prévisionnels de Secours (DPS)
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                {signedDps.map((dps) => (
                                    <div
                                        key={dps.id}
                                        className="p-6 bg-card border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow bg-white dark:bg-white/5"
                                    >
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded border border-orange-500/10">
                                                Engagement Ferme
                                            </span>
                                            <h4 className="text-sm font-bold text-foreground mt-1">
                                                Chiffrage Budgétaire - {dps.eventTitle}
                                            </h4>
                                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                                <Calendar size={12} /> Montant validé : {dps.totalMontant?.toFixed(2) || "0.00"} €
                                            </p>
                                        </div>

                                        <Button asChild variant="outline" className="h-11 rounded-xl text-xs font-bold border-border gap-2 shrink-0">
                                            <Link href={`/profile/devis/${dps.id}`}>
                                                <Download size={14} /> Consulter le devis
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
