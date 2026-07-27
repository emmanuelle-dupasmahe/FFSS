import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Confidentialite() {
    // On va chercher le contenu dynamique dans la base de données
    const dbContent = await prisma.siteContent.findUnique({
        where: { key: "CONFIDENTIALITE" }
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#001A3D] text-slate-900 dark:text-slate-200 py-12 px-6 transition-colors">
            <div className="max-w-3xl mx-auto space-y-8">
                <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> Retour à l'accueil
                </Link>

                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-blue-600">
                    Politique de Confidentialité (RGPD)
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
                                <h2 className="text-xl font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2">1. Collecte des données</h2>
                                <p className="text-sm leading-relaxed">
                                    Dans le cadre de ses activités (demandes de Dispositifs Prévisionnels de Secours - DPS, inscriptions aux formations), l'ASSTSF est amenée à collecter des données personnelles (nom, prénom, adresse e-mail, numéro de téléphone, informations sur la structure organisatrice).
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2">2. Finalité du traitement</h2>
                                <p className="text-sm leading-relaxed">
                                    Les données collectées sont strictement nécessaires à :
                                </p>
                                <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                                    <li>L'établissement des devis et fiches de dimensionnement (RIS).</li>
                                    <li>La facturation et le suivi administratif.</li>
                                    <li>L'organisation des formations de secourisme.</li>
                                    <li>La communication liée à vos événements ou inscriptions.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2">3. Conservation et sécurité</h2>
                                <p className="text-sm leading-relaxed">
                                    L'ASSTSF s'engage à ne conserver vos données personnelles que pour la durée strictement nécessaire aux finalités déclarées et dans le respect des obligations légales (notamment comptables et administratives). Vos données ne sont en aucun cas revendues ou cédées à des tiers.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2">4. Droits des utilisateurs</h2>
                                <p className="text-sm leading-relaxed">
                                    Conformément à la réglementation européenne en vigueur (RGPD), vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition sur vos données personnelles. Pour exercer ces droits, vous pouvez nous contacter à :
                                </p>
                                <p className="text-sm font-bold mt-2">
                                    E-mail : asst-laseyne@asstsf.fr<br />
                                    Courrier : ASSTSF, 98 Rue Fontaine, 83500 La Seyne
                                </p>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}