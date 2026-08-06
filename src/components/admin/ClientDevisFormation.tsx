"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Printer, User, Plus, Trash2, GraduationCap, Mail, Loader2 } from "lucide-react";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { processAndSendFormationDevis } from "@/app/actions/devis";
import { toast } from "sonner";



export default function ClientDevisFormation({ inscription, templateBody }: any) {
    // --- 1. LOGIQUE AUTOMATIQUE DE PRÉ-REMPLISSAGE ---
    const isStructure = inscription.typeDemande === "STRUCTURE";
    const titre = inscription.formation?.title?.toUpperCase() || "";

    // 🪛 NOUVEAU : Récupération et formatage des dates de la session choisie
    let datesSession = "";
    if (inscription.session) {
        const start = new Date(inscription.session.startDate).toLocaleDateString('fr-FR');
        const end = inscription.session.endDate ? new Date(inscription.session.endDate).toLocaleDateString('fr-FR') : start;
        datesSession = start === end ? `\nSession : Le ${start}` : `\nSession : Du ${start} au ${end}`;
    }

    let basePrice = 0;
    let descriptionBase = `Formation : ${inscription.formation?.title || "Inconnue"}${datesSession}`;
    let baseRemise = 0;

    // Déduction du prix selon tes règles
    if (titre.includes("BNSSA")) {
        if (titre.includes("RECYCLAGE")) {
            basePrice = 170;
        } else if (!inscription.hasPSE1) {
            basePrice = 500;
            descriptionBase += "\n(Inclut PSE1 + Réglementation)";
        } else {
            basePrice = 350;
        }
        if (inscription.swimLevel === "CLUB") {
            descriptionBase += "\n* Profil Nageur en Club";
            baseRemise = 10;
        }
    } else if (titre.includes("PSE1")) {
        basePrice = titre.includes("RECYCLAGE") ? 100 : 250;
    } else if (titre.includes("PSE2")) {
        basePrice = titre.includes("RECYCLAGE") ? 100 : 250;
    } else if (titre.includes("PSC")) {
        basePrice = 70;
    } else if (titre.includes("GQS")) {
        basePrice = 20;
    } else if (titre.includes("SSA")) {
        basePrice = titre.includes("RECYCLAGE") ? 120 : 220;
    }

    // Pré-remplissage des lignes
    const [lignes, setLignes] = useState([
        {
            id: 1,
            description: descriptionBase,
            quantite: isStructure ? (inscription.expectedParticipants || 1) : 1,
            prixUnitaire: basePrice,
            remisePct: isStructure ? 10 : baseRemise
        }
    ]);

    const [infos, setInfos] = useState({
        numero: `DEV-FORM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        clientNom: isStructure ? inscription.structureName : (inscription.user?.name || "Client"),
        clientAdresse: isStructure ? (inscription.location || "Adresse à compléter...") : "",
        email: inscription.user?.email || ""
    });

    // 🪛 AJOUT : Infos bancaires pour le devis
    const factureInfos = {
        iban: "FR76 3000 4000 0012 3456 7890 123",
        note: "Merci d'indiquer le n° du devis et le nom du candidat en libellé du virement."
    };

    // --- 2. GESTION DES ACTIONS ---
    const ajouterLigne = () => setLignes([...lignes, { id: Date.now(), description: "Frais de dossier...", quantite: 1, prixUnitaire: 0, remisePct: 0 }]);
    const supprimerLigne = (id: number) => setLignes(lignes.filter(l => l.id !== id));
    const modifierLigne = (id: number, champ: string, valeur: string | number) => {
        setLignes(lignes.map(l => l.id === id ? { ...l, [champ]: valeur } : l));
    };

    const totalHT = lignes.reduce((acc, l) => acc + (l.quantite * l.prixUnitaire), 0);
    const totalRemise = lignes.reduce((acc, l) => acc + (l.quantite * l.prixUnitaire * (l.remisePct / 100)), 0);
    const totalFinal = totalHT - totalRemise;

    // --- 3. GESTION MODALE & ENVOI ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const texteParDefaut = templateBody
        ? templateBody
            .replace(/{{formationName}}/g, inscription.formation?.title || "la formation")
            .replace(/{{clientName}}/g, inscription.user?.name || "Client")
        : `Bonjour ${inscription.user?.name || ''},\n\nVeuillez trouver ci-joint le devis concernant votre demande de formation pour "${inscription.formation?.title || 'notre session'}".\n\nNous restons à votre disposition pour toute question.`;

    const [emailBody, setEmailBody] = useState(texteParDefaut);
    const [isSending, setIsSending] = useState(false);


    // Fonction d'envoi !
    const handleConfirmSend = async () => {
        setIsSending(true);
        toast.loading("Création du PDF officiel et envoi de l'e-mail...", { id: "send-devis" });

        try {
            const element = document.getElementById("zone-pdf-officiel");
            if (!element) throw new Error("Feuille officielle introuvable");

            element.classList.remove("only-print");
            element.style.width = "210mm";
            element.style.minHeight = "297mm";
            element.style.position = "absolute";
            element.style.top = "0";
            element.style.left = "0";
            element.style.zIndex = "-9999";

            const imgData = await htmlToImage.toJpeg(element, {
                quality: 0.8,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                skipFonts: true
            });

            element.style.width = "";
            element.style.minHeight = "";
            element.style.position = "";
            element.style.top = "";
            element.style.left = "";
            element.style.zIndex = "";
            element.classList.add("only-print");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
            const pdfBase64 = pdf.output("datauristring");

            const result = await processAndSendFormationDevis(inscription.id, emailBody, pdfBase64, totalFinal);

            if (result.success) {
                toast.success("Devis officiel envoyé avec succès !", { id: "send-devis" });
                setIsModalOpen(false);
            } else {
                toast.error("Échec de l'envoi : " + result.error, { id: "send-devis" });
            }
        } catch (error) {
            console.error("Erreur PDF:", error);
            toast.error("Erreur lors de la génération du document.", { id: "send-devis" });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="relative">

            <div className="no-print grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-slate-50 dark:bg-[#001A3D] min-h-screen">

                {/* --- CONSOLE ADMIN --- */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black uppercase italic dark:text-white flex items-center gap-2">
                        <GraduationCap className="text-blue-600" /> Éditeur Devis Formation
                    </h2>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl font-black uppercase text-white shadow-xl flex gap-2">
                                <Mail size={18} /> Réviser & Envoyer par Mail
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#001A3D] border-slate-200 dark:border-white/10 rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase italic text-blue-600">
                                    Validation de l'envoi
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">
                                    Destinataire : {infos.email}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Corps du message (modifiable)</Label>
                                <Textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="min-h-[200px] text-sm dark:bg-[#001A3D] border-slate-200 dark:border-white/20 rounded-xl"
                                    placeholder="Écrivez votre message ici..."
                                />
                                <p className="text-[10px] italic text-slate-400">Note : Le devis PDF officiel sera généré et ajouté en pièce jointe.</p>
                            </div>

                            <DialogFooter className="flex gap-2">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl uppercase font-black text-[10px]">
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleConfirmSend}
                                    disabled={isSending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 uppercase font-black text-[10px] flex gap-2"
                                >
                                    {isSending ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />}
                                    Confirmer l'envoi
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
                        <Label className="text-[10px] font-black uppercase text-blue-600">Candidat / Structure</Label>
                        <Input value={infos.clientNom} onChange={(e) => setInfos({ ...infos, clientNom: e.target.value })} className="dark:bg-[#001A3D] font-bold" />
                        <Textarea value={infos.clientAdresse} onChange={(e) => setInfos({ ...infos, clientAdresse: e.target.value })} placeholder="Détails du contact ou adresse (facultatif)" className="dark:bg-[#001A3D]" />
                    </div>

                    <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase text-blue-600">Détail du Devis</Label>
                            <Button size="sm" variant="outline" onClick={ajouterLigne} className="h-7 text-[9px] uppercase font-black"><Plus size={12} className="mr-1" /> Ajouter</Button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-[8px] font-bold text-slate-400 uppercase px-1">
                                <div className="col-span-6">Désignation</div>
                                <div className="col-span-2 text-center">Qté</div>
                                <div className="col-span-2 text-center">P.U (€)</div>
                                <div className="col-span-2 text-center">Rem. (%)</div>
                            </div>
                            {lignes.map((l) => (
                                <div key={l.id} className="grid grid-cols-12 gap-2 items-start">
                                    <Textarea value={l.description} onChange={(e) => modifierLigne(l.id, 'description', e.target.value)} className="col-span-6 text-xs dark:bg-[#001A3D] min-h-[60px] resize-none" />
                                    <Input type="number" value={l.quantite} onChange={(e) => modifierLigne(l.id, 'quantite', Number(e.target.value))} className="col-span-2 text-xs text-center dark:bg-[#001A3D]" />
                                    <Input type="number" value={l.prixUnitaire} onChange={(e) => modifierLigne(l.id, 'prixUnitaire', Number(e.target.value))} className="col-span-2 text-xs text-center dark:bg-[#001A3D]" />
                                    <div className="col-span-2 flex gap-1 items-center">
                                        <Input
                                            type="number"
                                            value={l.remisePct}
                                            onChange={(e) => modifierLigne(l.id, 'remisePct', Number(e.target.value))}
                                            className="col-span-2 text-[11px] text-center dark:bg-[#001A3D] px-1"
                                        />
                                        <button onClick={() => supprimerLigne(l.id)} className="text-red-500 p-1"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button onClick={() => window.print()} className="w-full bg-blue-600 hover:bg-blue-700 h-16 rounded-2xl font-black uppercase text-white shadow-xl">
                        <Printer className="mr-2" /> Générer le Devis PDF
                    </Button>
                </div>

                {/* --- APERÇU ÉCRAN (Sans le "zone-pdf") --- */}
                <div className="preview-paper bg-white rounded-[3rem] p-12 flex flex-col shadow-2xl sticky top-8 print:text-black print:bg-white text-slate-900">
                    <div className="flex justify-between items-start border-b-2 pb-8 mb-8 border-slate-200 print:border-black">
                        <img src="/log_asstsf.png" alt="Logo" className="w-16 h-16 object-contain" />
                        <div className="text-right">
                            <h3 className="text-2xl font-black italic text-blue-600 uppercase">Devis Formation</h3>
                            <p className="text-xs font-bold uppercase tracking-widest">{infos.numero}</p>
                            <p className="text-[9px] text-slate-400 print:text-slate-500">Émis le {new Date(infos.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>

                    <div className="mb-12 text-right">
                        <p className="text-[8px] font-black uppercase text-slate-400 print:text-slate-500 mb-1">Candidat / Structure</p>
                        <p className="text-sm font-black uppercase leading-tight">{infos.clientNom}</p>
                        <p className="text-[10px] italic whitespace-pre-line">{infos.clientAdresse}</p>
                    </div>

                    <div className="flex-grow">
                        <table className="w-full text-left">
                            <thead className="border-b text-[9px] font-black uppercase border-slate-200 print:border-black">
                                <tr>
                                    <th className="py-2">Formation & Détails</th>
                                    <th className="py-2 text-center">Qté</th>
                                    <th className="py-2 text-right">P.U</th>
                                    <th className="py-2 text-right">Remise</th>
                                    <th className="py-2 text-right">Total Net</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {lignes.map((l) => (
                                    <tr key={l.id} className="border-b border-slate-50 print:border-slate-200">
                                        <td className="py-4 font-medium whitespace-pre-line">{l.description}</td>
                                        <td className="py-4 text-center">{l.quantite}</td>
                                        <td className="py-4 text-right">{l.prixUnitaire} €</td>
                                        <td className="py-4 text-right">{l.remisePct > 0 ? `-${l.remisePct}%` : '-'}</td>
                                        <td className="py-4 text-right font-black">{(l.quantite * l.prixUnitaire * (1 - l.remisePct / 100)).toFixed(2)} €</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 pt-6 border-t-2 border-slate-200 print:border-black">
                        <div className="flex justify-between items-end">
                            <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 space-y-1">
                                <p>Validité de l'offre : 30 jours</p>
                                <p>Exonération de TVA - Article 261-7-1 du CGI</p>
                                {totalRemise > 0 && <p className="text-emerald-600 print:text-emerald-700 mt-2">Économie réalisée : {totalRemise.toFixed(2)} €</p>}
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 block mb-1">Total Net Estimé</span>
                                <div className="text-4xl font-black italic tracking-tighter">{totalFinal.toFixed(2)} €</div>
                            </div>
                        </div>
                        {/* 🪛 NOUVEAU : BLOC INFOS PAIEMENT */}
                        <div className="mt-4 pt-4 border-t border-slate-100 print:border-slate-200">
                            <p className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed">
                                Règlement par virement ou chèque à l'ordre de l'ASSTSF<br />
                                IBAN : {factureInfos.iban}<br />
                                <span className="italic font-normal">{factureInfos.note}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 mt-10">
                        <div className="border-t-2 border-black pt-4">
                            <p className="text-[10px] font-black uppercase underline italic mb-2">Le Candidat / La Structure (Bon pour accord) :</p>

                            {inscription.isDevisSigned && inscription.devisSignatureImg ? (
                                <div className="mt-2 text-left mb-6">
                                    <img
                                        src={inscription.devisSignatureImg}
                                        alt="Signature Client"
                                        className="h-16 object-contain mix-blend-multiply"
                                    />
                                    <p className="text-[8px] font-bold text-emerald-600 mt-1">
                                        Signé numériquement le {inscription.devisSignedAt ? new Date(inscription.devisSignedAt).toLocaleDateString('fr-FR') : ''}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-2 mb-24">
                                    <p className="text-[8px] text-gray-400">Date et Signature</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t-2 border-black pt-4">
                            <p className="text-[10px] font-black uppercase underline italic mb-2">Pour l'ASSTSF (Le Centre de Formation) :</p>
                            <div className="relative h-20 mb-2 w-full">
                                <img src="/cachet-asso.png" alt="Cachet ASSTSF" className="absolute top-0 left-0 w-20 h-20 object-contain opacity-80 mix-blend-multiply" />
                                <img src="/pres.png" alt="Signature Président" className="absolute top-2 left-10 w-28 h-auto object-contain mix-blend-multiply" />
                            </div>
                            <p className="text-[8px] text-gray-400">Fait le {new Date(infos.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FEUILLE PDF OFFICIELLE (Avec le "zone-pdf-officiel") --- */}
            <div id="zone-pdf-officiel" className="only-print bg-white text-black print:text-black font-sans p-[15mm]">
                <div className="flex justify-between items-center border-b-4 border-black pb-8 mb-10">
                    <img src="/log_asstsf.png" alt="Logo" className="w-20 h-20 object-contain" />
                    <div className="text-right">
                        <h1 className="text-4xl font-black uppercase italic leading-none">Devis Formation</h1>
                        <p className="text-sm font-bold mt-2">N° {infos.numero}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-16">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Centre de formation :</p>
                        <p className="text-sm font-black">ASSTSF</p>
                        <p className="text-xs">Affiliée FFSS</p>
                        <p className="text-xs">Agréée Sécurité Civile</p>
                        <p className="text-xs font-bold mt-2">SIRET 401 715 107 00033</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Destinataire :</p>
                        <p className="text-sm font-black uppercase">{infos.clientNom}</p>
                        <p className="text-xs italic whitespace-pre-line">{infos.clientAdresse}</p>
                    </div>
                </div>

                <table className="w-full text-left border-collapse mb-10">
                    <thead className="border-b-2 border-black text-[10px] font-black uppercase">
                        <tr>
                            <th className="py-3">Désignation de la formation</th>
                            <th className="py-3 text-center">Participants</th>
                            <th className="py-3 text-right">Prix Unitaire</th>
                            <th className="py-3 text-right">Remise</th>
                            <th className="py-3 text-right">Montant Net</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                        {lignes.map((l) => (
                            <tr key={l.id} className="border-b border-gray-100">
                                <td className="py-6 whitespace-pre-line">{l.description}</td>
                                <td className="py-6 text-center">{l.quantite}</td>
                                <td className="py-6 text-right">{l.prixUnitaire} €</td>
                                <td className="py-6 text-right">{l.remisePct > 0 ? `-${l.remisePct}%` : '-'}</td>
                                <td className="py-6 text-right font-black">{(l.quantite * l.prixUnitaire * (1 - l.remisePct / 100)).toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {totalRemise > 0 && (
                    <div className="text-right mb-4 text-xs font-bold text-gray-600">
                        Total des remises accordées : -{totalRemise.toFixed(2)} €
                    </div>
                )}

                <div className="border-t-4 border-black pt-6 flex justify-between items-start mb-10">
                    <div className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed space-y-1">
                        <p>Validité de l'offre : 30 jours</p>
                        <p>Exonération de TVA - Article 261-7-1 du CGI</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-blue-600 uppercase mb-2">Total Net à régler</p>
                        <div className="text-5xl font-black italic tracking-tighter">{totalFinal.toFixed(2)} €</div>
                    </div>
                </div>

                {/* 🪛 NOUVEAU : BLOC INFOS PAIEMENT SUR LE PDF */}
                <div className="mb-16">
                    <div className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-black">Règlement par virement ou chèque à l'ordre de l'ASSTSF</p>
                        <p>IBAN : {factureInfos.iban}</p>
                        <p className="italic font-normal mt-1">{factureInfos.note}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                    <div className="border-t-2 border-black pt-4">
                        <p className="text-[10px] font-black uppercase underline italic mb-2">Le Candidat / La Structure (Bon pour accord) :</p>

                        {inscription.isDevisSigned && inscription.devisSignatureImg ? (
                            <div className="mt-2 text-left mb-6">
                                <img
                                    src={inscription.devisSignatureImg}
                                    alt="Signature Client"
                                    className="h-16 object-contain mix-blend-multiply"
                                />
                                <p className="text-[8px] font-bold text-emerald-600 mt-1">
                                    Signé numériquement le {inscription.devisSignedAt ? new Date(inscription.devisSignedAt).toLocaleDateString('fr-FR') : ''}
                                </p>
                            </div>
                        ) : (
                            <div className="mt-2 mb-24">
                                <p className="text-[8px] text-gray-400">Date et Signature</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t-2 border-black pt-4">
                        <p className="text-[10px] font-black uppercase underline italic mb-2">Pour l'ASSTSF (Le Centre de Formation) :</p>
                        <div className="relative h-20 mb-2 w-full">
                            <img src="/cachet-asso.png" alt="Cachet ASSTSF" className="absolute top-0 left-0 w-20 h-20 object-contain opacity-80 mix-blend-multiply" />
                            <img src="/pres.png" alt="Signature Président" className="absolute top-2 left-10 w-28 h-auto object-contain mix-blend-multiply" />
                        </div>
                        <p className="text-[8px] text-gray-400">Fait le {new Date(infos.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}