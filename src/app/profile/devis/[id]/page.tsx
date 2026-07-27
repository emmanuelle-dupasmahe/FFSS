import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Banknote } from "lucide-react";
import DevisSignatureClient from "./DevisSignatureClient";
import DownloadPdfButton from "../../conventions/[id]/DownloadPdfButton"; // On réutilise le bouton !

export default async function DevisClientPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user?.email) {
        redirect("/login");
    }

    const devis = await prisma.devisDPS.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!devis || devis.user.email !== session.user.email) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-16">
            <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
                <ArrowLeft size={16} /> Retour au tableau de bord
            </Link>

            {/* Conteneur principal du document */}
            <div id="document-devis-financier" className="bg-white text-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-200 relative">

                {/* En-tête du Devis */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8 text-left">
                    <div className="flex items-center gap-4">
                        <img src="/log_asstsf.png" alt="ASSTSF Logo" className="w-16 h-16 object-contain hidden md:block" />
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">Devis Financier</h1>
                            <p className="text-sm font-bold text-slate-500 mt-1">Réf: DEV-{devis.id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Banknote size={40} className="text-emerald-500 ml-auto mb-2" />
                        <p className="text-[10px] font-bold uppercase text-slate-400">Émis le {new Date(devis.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>

                {/* Informations de l'événement */}
                <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Organisateur</p>
                        <p className="font-bold text-sm">{devis.organismeDemandeur || devis.user.name}</p>
                        <p className="text-xs text-slate-600">{devis.emailContact || devis.user.email}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Événement</p>
                        <p className="font-bold text-sm">{devis.eventTitle}</p>
                        <p className="text-xs text-slate-600">Le {devis.eventDate.toLocaleDateString('fr-FR')} à {devis.location}</p>
                    </div>
                </div>

                {/* 🆕 Tableau financier intégré */}
                <div className="mb-12">
                    <h3 className="font-black uppercase text-[12px] bg-slate-100 text-black p-2 mb-4 text-left">Détail de la prestation :</h3>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider">Désignation de la prestation</th>
                                    <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider text-right">Montant estimatif</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-4 border-b border-slate-100">
                                        <p className="font-bold text-slate-900">Forfait Dispositif Prévisionnel de Secours</p>
                                        <p className="text-xs text-slate-500 mt-1">Mobilisation des équipes (incluant installation/rangement), matériel technique et déplacements associés (le cas échéant) selon la fiche de dimensionnement établie.</p>
                                    </td>
                                    <td className="p-4 border-b border-slate-100 text-right font-black text-slate-900 align-top">
                                        {/* On utilise la valeur stockée par l'admin lors de l'envoi du chiffrage */}
                                        {devis.totalMontant ? devis.totalMontant.toLocaleString('fr-FR') : "--"} €
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="bg-emerald-50/50 p-6 flex justify-between items-center border-t border-slate-200">
                            <div className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed text-left">
                                <p>TVA non applicable (art. 261-7-1 du CGI)</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-emerald-600 uppercase mb-1">Total Net à Payer</p>
                                <div className="text-4xl font-black italic tracking-tighter text-slate-900">
                                    {devis.totalMontant ? devis.totalMontant.toLocaleString('fr-FR') : "0"} €
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zone de Signature Dynamique */}
                <div className="mt-12 pt-8 border-t-2 border-slate-100">
                    <div className="grid grid-cols-2 gap-10 mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase underline italic mb-4">L'Association ASSTSF :</p>
                            <p className="text-[10px] text-gray-900 font-bold mb-1">Sauveur AMICO, Président</p>
                            <div className="relative h-16 mt-2">
                                <img src="/cachet-asso.png" alt="Cachet ASSTSF" className="absolute top-0 left-0 w-48 h-48 object-contain opacity-80" />
                                <img src="/pres.png" alt="Signature Président" className="absolute top-0 left-0 w-24 h-12 object-contain mix-blend-multiply" />
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase underline italic mb-4">Le Client / L'Organisateur :</p>
                            <p className="text-[8px] text-gray-500 italic mb-2">Mention "Bon pour accord", date et signature</p>

                            {devis.devisIsSigned && devis.devisSignatureImg && (
                                <div className="flex flex-col items-end">
                                    <img src={devis.devisSignatureImg} alt="Signature Client" className="h-16 object-contain mix-blend-multiply" />
                                    <p className="text-[7px] font-bold text-emerald-600 mt-1">
                                        Signé numériquement le {devis.devisSignedAt?.toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {devis.devisIsSigned ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center mt-8">
                            <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
                            <h3 className="text-lg font-black text-emerald-800 uppercase tracking-widest">Devis validé</h3>
                            <p className="text-sm text-emerald-600 font-medium">
                                Votre accord a été enregistré. Ce document tient lieu de commande ferme.
                            </p>
                        </div>
                    ) : (
                        <DevisSignatureClient devisId={devis.id} />
                    )}
                </div>
            </div>

            {/* Bouton de téléchargement PDF qui s'affiche uniquement si signé */}
            {devis.devisIsSigned && (
                <div className="flex justify-center mt-6">
                    <DownloadPdfButton
                        targetId="document-devis-financier"
                        fileName={`Devis_Signe_${devis.eventTitle.replace(/\s+/g, '_')}.pdf`}
                    />
                </div>
            )}
        </div>
    );
}