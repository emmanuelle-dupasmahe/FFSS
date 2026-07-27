import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function MentionsLegales() {
    // On va chercher le contenu dynamique dans la base de données
    const dbContent = await prisma.siteContent.findUnique({
        where: { key: "MENTIONS_LEGALES" }
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#001A3D] text-slate-900 dark:text-slate-200 py-12 px-6 transition-colors">
            <div className="max-w-3xl mx-auto space-y-8">
                <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> Retour à l'accueil
                </Link>

                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-blue-600">
                    Mentions Légales
                </h1>

                <div className="space-y-8 bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                    {dbContent ? (
                        /* Affichage dynamique depuis l'administration (rendu HTML) */
                        <div
                            className="text-sm leading-relaxed space-y-4"
                            dangerouslySetInnerHTML={{ __html: dbContent.value }}
                        />
                    ) : (
                        /* Texte par défaut si rien n'est configuré en base de données */
                        <>
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2">1. Éditeur du site</h2>
                                <p className="text-sm leading-relaxed">
                                    Le présent site est édité par l'association <strong>ASSTSF</strong> (Association Agréée de Sécurité Civile - FFSS).<br />
                                    <strong>Siège social :</strong> 98 Rue Fontaine, 83500 La Seyne<br />
                                    <strong>SIRET :</strong> 411 371 422 00015<br />
                                    <strong>E-mail :</strong> asst-laseyne@asstsf.fr
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2">2. Directeur de la publication</h2>
                                <p className="text-sm leading-relaxed">
                                    Le directeur de la publication est <strong>[PRÉNOM NOM DU PRÉSIDENT OU RESPONSABLE]</strong>, en qualité de <strong>[FONCTION]</strong> de l'association ASSTSF.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2">3. Hébergement</h2>
                                <p className="text-sm leading-relaxed">
                                    Ce site est hébergé par :<br />
                                    <strong>[NOM DE L'HÉBERGEUR (ex: Vercel, OVH, o2switch)]</strong><br />
                                    <strong>Adresse :</strong> [ADRESSE DE L'HÉBERGEUR]<br />
                                    <strong>Site web :</strong> https://www.captaincontrat.com/gestion/politique-de-confidentialite-rgpd/la-responsabilite-de-lhebergeur-me-lefroy
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2">4. Propriété intellectuelle</h2>
                                <p className="text-sm leading-relaxed">
                                    L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                                </p>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}