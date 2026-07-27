import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";
import ClientChiffrage from "@/components/admin/ClientChiffrage";

export default async function ChiffragePage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const devis = await prisma.devisDPS.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!devis) notFound();

    const templateChiffrage = await prisma.emailTemplate.findUnique({
        where: { type: "CHIFFRAGE" }
    });

    const p2 = devis.p2 || 0.25;
    const e1 = devis.e1 || 0.25;
    const e2 = devis.e2 || 0.25;
    const p1 = Number(devis.expectedPublic || 0);
    const p_lisse = p1 <= 100000 ? p1 : 100000 + (p1 - 100000) / 2;
    const ris = (p2 + e1 + e2) * (p_lisse / 1000);

    let effectif = ris <= 1.125 ? 2 : Math.max(4, Math.ceil(ris / 2) * 2);
    if (ris > 12) effectif = Math.max(12, Math.ceil(ris / 2) * 2);
    if (ris > 36) effectif = Math.max(36, Math.ceil(ris / 2) * 2);

    return (
        /* 🛠️ AJOUT DES CLASSES `print:...` POUR NETTOYER LE FOND ET LES MARGES À L'IMPRESSION */
        <div className="min-h-screen bg-slate-50 dark:bg-[#001A3D] p-4 md:p-8 transition-colors duration-300 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:max-w-none print:w-full print:space-y-0">

                {/* Navigation - 🛠️ AJOUT DE `print:hidden` POUR LA CACHER */}
                <div className="flex justify-between items-center print:hidden">
                    <Link href={`/admin/devis-dps/${id}`} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-blue-600 transition-colors">
                        <ArrowLeft size={18} /> Retour à la fiche RIS
                    </Link>
                    <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-xs tracking-widest">
                        <Calculator size={18} /> Module de Chiffrage Financier
                    </div>
                </div>

                {/* Le bloc blanc principal - 🛠️ AJOUT DE `print:border-none print:shadow-none...` */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-white/10 print:p-0 print:border-none print:shadow-none print:bg-transparent print:rounded-none">

                    {/* Titre - 🛠️ AJOUT DE `print:hidden` POUR LE CACHER */}
                    <div className="mb-8 print:hidden">
                        <h1 className="text-3xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                            Devis <span className="text-blue-600">Financier</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Générez la proposition commerciale pour {devis.eventTitle}</p>
                    </div>

                    <ClientChiffrage
                        eventTitle={devis.eventTitle}
                        location={devis.location}
                        effectifInitial={effectif}
                        devisDpsId={devis.id}
                        userEmail={devis.emailContact || devis.user?.email || ""}
                        templateBody={templateChiffrage?.body}
                        organismeDemandeur={devis.organismeDemandeur}
                        nomContact={devis.nomContact}
                        telephoneContact={devis.telephoneContact}
                        eventDate={devis.eventDate}
                        endDate={devis.endDate}
                        fournitLocal={devis.fournitLocal}
                    />
                </div>
            </div>
        </div>
    );
}