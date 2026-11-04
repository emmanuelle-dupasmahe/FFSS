"use client";

import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Printer, FileText, User, Plus, Trash2, ArrowLeft, Mail, Loader2, Download } from "lucide-react";
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
import { processAndSendFormationFacture, reserveFormationFactureNumero } from "@/app/actions/devis";
import { toast } from "sonner";

export default function ClientFactureFormation({ inscription, templateBody, ibanAsso, bicAsso, adresseAsso }: any) {
    const isStructure = inscription.typeDemande === "STRUCTURE";
    const user = inscription.user;
    const dejaEnvoyee = !!inscription.factureUrl;

    // Dates de la session pour la désignation
    let datesSession = "";
    if (inscription.session?.startDate) {
        const start = new Date(inscription.session.startDate).toLocaleDateString('fr-FR');
        const end = inscription.session.endDate ? new Date(inscription.session.endDate).toLocaleDateString('fr-FR') : start;
        datesSession = start === end ? `\nSession : Le ${start}` : `\nSession : Du ${start} au ${end}`;
    }

    const adresseUser = [user?.address, [user?.zipCode, user?.city].filter(Boolean).join(" ")].filter(Boolean).join("\n");

    const [numero, setNumero] = useState<string>(inscription.factureNumero || "");
    const [infos, setInfos] = useState({
        date: (inscription.factureDate ? new Date(inscription.factureDate) : new Date()).toISOString().split('T')[0],
        clientNom: isStructure ? (inscription.structureName || "") : (user?.name || ""),
        clientAdresse: isStructure
            ? [inscription.location, inscription.siret ? `SIRET : ${inscription.siret}` : ""].filter(Boolean).join("\n")
            : adresseUser,
        iban: ibanAsso || "FR76 3000 3020 8000 0372 7030 983",
        bic: bicAsso || "SOGEFRPP",
        note: "Exonération de TVA - Article 261-7-1 du CGI"
    });

    const [lignes, setLignes] = useState([
        {
            id: 1,
            description: `Formation : ${inscription.formation?.title || "Inconnue"}${datesSession}`,
            montant: inscription.prixTotal || 0
        }
    ]);

    const ajouterLigne = () => setLignes([...lignes, { id: Date.now(), description: "Nouvelle prestation...", montant: 0 }]);
    const supprimerLigne = (id: number) => setLignes(lignes.filter(l => l.id !== id));
    const modifierLigne = (id: number, champ: string, valeur: string | number) => {
        setLignes(lignes.map(l => l.id === id ? { ...l, [champ]: valeur } : l));
    };

    const totalFinal = lignes.reduce((acc, curr) => acc + Number(curr.montant), 0);
    const dejaRegle = (inscription.paiements || []).reduce((acc: number, p: any) => acc + p.montant, 0);
    const resteAPayer = totalFinal - dejaRegle;

    // --- GESTION MODALE & ENVOI ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const texteParDefaut = templateBody
        ? templateBody
            .replace(/{{formationName}}/g, inscription.formation?.title || "la formation")
            .replace(/{{clientName}}/g, user?.name || "Client")
        : `Bonjour ${user?.name || ''},\n\nVeuillez trouver ci-joint la facture n°{{numero}} concernant votre formation "${inscription.formation?.title || ''}".\n\nNous vous remercions de votre confiance.`;

    const [emailBody, setEmailBody] = useState(texteParDefaut);
    const [isSending, setIsSending] = useState(false);

    // Le numéro n'est attribué qu'au dernier moment, pour ne pas créer de trou dans la numérotation
    const obtenirNumero = async () => {
        if (numero) return numero;
        const result = await reserveFormationFactureNumero(inscription.id);
        if (!result.success || !result.numero) throw new Error(result.error || "Numéro indisponible");
        const nouveauNumero = result.numero;
        // Le numéro doit être affiché sur la feuille avant de la capturer ou de l'imprimer
        flushSync(() => setNumero(nouveauNumero));
        return nouveauNumero;
    };

    const handlePrint = async () => {
        if (totalFinal <= 0) {
            toast.error("Indiquez un montant avant d'imprimer la facture.");
            return;
        }
        try {
            await obtenirNumero();
            window.print();
        } catch (error) {
            console.error(error);
            toast.error("Impossible d'attribuer un numéro de facture.");
        }
    };

    const handleConfirmSend = async () => {
        if (totalFinal <= 0) {
            toast.error("Indiquez un montant avant d'envoyer la facture.");
            return;
        }

        setIsSending(true);
        toast.loading("Génération de la facture officielle et envoi...", { id: "send-facture" });

        try {
            const numeroFacture = await obtenirNumero();

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

            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
            const pdfBase64 = pdf.output("datauristring");

            const result = await processAndSendFormationFacture({
                inscriptionId: inscription.id,
                dateFacture: infos.date,
                total: totalFinal,
                customMessage: emailBody.replace(/{{numero}}/g, numeroFacture),
                pdfBase64
            });

            if (result.success) {
                toast.success("Facture envoyée avec succès !", { id: "send-facture" });
                setIsModalOpen(false);
            } else {
                toast.error(`Échec de l'envoi : ${result.error}`, { id: "send-facture" });
            }
        } catch (error) {
            console.error("Erreur PDF:", error);
            toast.error("Erreur lors de la génération de la facture.", { id: "send-facture" });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="relative">

            {/* --- CONSOLE ADMIN --- */}
            <div className="no-print grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-slate-50 dark:bg-[#001A3D] min-h-screen transition-colors">

                <div className="space-y-6 overflow-y-auto max-h-[90vh] pr-2">
                    <Link href={`/admin/inscriptions/${inscription.id}`} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors mb-2">
                        <ArrowLeft size={16} /> Retour au dossier
                    </Link>

                    <h2 className="text-xl font-black uppercase italic dark:text-white flex items-center gap-2">
                        <FileText className="text-blue-600" /> Facture Formation
                    </h2>

                    {dejaEnvoyee && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                La facture {numero} a déjà été envoyée le {new Date(inscription.factureDate).toLocaleDateString('fr-FR')}. Un nouvel envoi conservera ce numéro et remplacera le PDF archivé. Une facture émise ne doit normalement plus être modifiée.
                            </p>
                            <a
                                href={inscription.factureUrl}
                                download={`Facture_${numero}.pdf`}
                                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                            >
                                <Download size={14} /> Télécharger le PDF envoyé
                            </a>
                        </div>
                    )}

                    {totalFinal <= 0 && (
                        <p className="p-4 rounded-2xl bg-red-500/10 text-xs text-red-600 dark:text-red-400">
                            Aucun prix n'est enregistré pour ce dossier : renseignez le montant ci-dessous.
                        </p>
                    )}

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-16 rounded-2xl font-black uppercase text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mb-4">
                                <Mail size={18} /> Réviser & Envoyer par Mail
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#001A3D] border-slate-200 dark:border-white/10 rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase italic text-blue-600">
                                    Validation de la Facture
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">
                                    Destinataire : {user?.email || "Client"}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Corps du message</Label>
                                <Textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="min-h-[200px] text-sm dark:bg-[#001A3D] border-slate-200 dark:border-white/20 rounded-xl"
                                />
                                <p className="text-[10px] italic text-slate-400">
                                    {"{{numero}}"} sera remplacé par le numéro de facture. La facture PDF sera ajoutée en pièce jointe.
                                </p>
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

                    {/* Bloc Client */}
                    <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
                        <Label className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2"><User size={14} /> Destinataire</Label>
                        <Input placeholder="Nom du client" value={infos.clientNom} onChange={(e) => setInfos({ ...infos, clientNom: e.target.value })} className="dark:bg-[#001A3D]" />
                        <Textarea placeholder="Adresse complète" value={infos.clientAdresse} onChange={(e) => setInfos({ ...infos, clientAdresse: e.target.value })} className="dark:bg-[#001A3D]" />
                    </div>

                    {/* Bloc Détails Facture */}
                    <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-400">N° Facture</Label>
                            <Input value={numero || "Attribué à l'envoi"} disabled className="dark:bg-[#001A3D]" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-400">Date</Label>
                            <Input type="date" value={infos.date} onChange={(e) => setInfos({ ...infos, date: e.target.value })} className="dark:bg-[#001A3D]" />
                        </div>
                    </div>

                    {/* Bloc Lignes */}
                    <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase text-blue-600">Désignations & Tarifs</Label>
                            <Button size="sm" variant="outline" onClick={ajouterLigne} className="h-7 text-[9px] uppercase font-black"><Plus size={12} className="mr-1" /> Ajouter</Button>
                        </div>
                        {lignes.map((ligne) => (
                            <div key={ligne.id} className="flex gap-2 items-start">
                                <Textarea value={ligne.description} onChange={(e) => modifierLigne(ligne.id, 'description', e.target.value)} className="flex-grow dark:bg-[#001A3D] text-xs min-h-[60px] resize-none" />
                                <Input type="number" value={ligne.montant} onChange={(e) => modifierLigne(ligne.id, 'montant', e.target.value)} className="w-24 dark:bg-[#001A3D] text-xs text-right" />
                                <Button size="icon" variant="ghost" onClick={() => supprimerLigne(ligne.id)} className="text-red-500 hover:text-red-700 h-9 w-9"><Trash2 size={14} /></Button>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Coordonnées Bancaires (RIB)</Label>
                        <Input value={infos.iban} onChange={(e) => setInfos({ ...infos, iban: e.target.value })} className="dark:bg-[#001A3D] text-xs" />
                        <Input value={infos.bic} onChange={(e) => setInfos({ ...infos, bic: e.target.value })} placeholder="BIC" className="dark:bg-[#001A3D] text-xs" />
                    </div>

                    <Button onClick={handlePrint} className="w-full bg-slate-800 hover:bg-slate-900 h-14 rounded-2xl font-black uppercase text-white shadow-xl transition-all active:scale-95">
                        <Printer className="mr-2" /> Imprimer le PDF localement
                    </Button>
                </div>

                {/* --- APERÇU DYNAMIQUE (Feuille de droite) --- */}
                <div className="preview-paper bg-white text-slate-900 rounded-[3rem] p-12 flex flex-col shadow-2xl sticky top-8">
                    <div className="flex justify-between items-start border-b-2 pb-8 mb-8">
                        <img src="/log_asstsf.png" alt="Logo" className="w-16 h-16 object-contain" />
                        <div className="text-right">
                            <h3 className="text-2xl font-black italic text-blue-600 uppercase">Facture</h3>
                            <p className="text-xs font-bold uppercase tracking-widest">{numero || "N° à l'envoi"}</p>
                            <p className="text-[9px] text-slate-400">Émise le {new Date(infos.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Émetteur</p>
                            <p className="text-xs font-black">ASSTSF SECOURISME</p>
                            <p className="text-[9px]">{adresseAsso || "98 Rue Fontaine, 83500 La Seyne sur Mer"}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Destinataire</p>
                            <p className="text-xs font-black uppercase leading-tight">{infos.clientNom}</p>
                            <p className="text-[10px] italic whitespace-pre-line">{infos.clientAdresse}</p>
                        </div>
                    </div>

                    <div className="flex-grow">
                        <table className="w-full text-left">
                            <thead className="border-b text-[9px] font-black uppercase">
                                <tr>
                                    <th className="py-2">Description</th>
                                    <th className="py-2 text-right">Montant</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {lignes.map((l) => (
                                    <tr key={l.id} className="border-b border-slate-50">
                                        <td className="py-4 font-medium whitespace-pre-line">{l.description}</td>
                                        <td className="py-4 text-right font-black">{Number(l.montant).toFixed(2)} €</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 pt-6 border-t-2 space-y-1 text-right">
                        <p className="text-xs">Total : <span className="font-black">{totalFinal.toFixed(2)} €</span></p>
                        {dejaRegle > 0 && <p className="text-xs text-emerald-600">Déjà réglé : -{dejaRegle.toFixed(2)} €</p>}
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 block pt-2">Reste à payer</span>
                        <div className="text-4xl font-black italic tracking-tighter">{Math.max(resteAPayer, 0).toFixed(2)} €</div>
                        <p className="text-[8px] text-slate-400 pt-4 uppercase font-bold text-left">
                            Règlement par virement ou chèque à l'ordre de l'ASSTSF - IBAN : {infos.iban} - BIC : {infos.bic}
                        </p>
                        <p className="text-[8px] text-slate-400 uppercase font-bold text-left">{infos.note}</p>
                    </div>
                </div>
            </div>

            {/* --- FEUILLE PDF OFFICIELLE (Cachée à l'écran) --- */}
            <div id="zone-pdf-officiel" className="only-print bg-white text-black font-sans p-[15mm]">
                <div className="flex justify-between items-center border-b-4 border-black pb-8 mb-10">
                    <img src="/log_asstsf.png" alt="Logo" className="w-20 h-20 object-contain" />
                    <div className="text-right">
                        <h1 className="text-4xl font-black uppercase italic leading-none">Facture</h1>
                        <p className="text-sm font-bold mt-2">N° {numero}</p>
                        <p className="text-xs mt-1">Émise le {new Date(infos.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-14">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">De :</p>
                        <p className="text-sm font-black">ASSTSF</p>
                        <p className="text-xs">{adresseAsso || "98 Rue Fontaine, 83500 La Seyne sur Mer"}</p>
                        <p className="text-xs">Affiliée FFSS</p>
                        <p className="text-xs">Agréée Sécurité Civile</p>
                        <p className="text-xs font-bold mt-2">SIRET 401 715 107 00033</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">À :</p>
                        <p className="text-sm font-black uppercase">{infos.clientNom}</p>
                        <p className="text-xs italic whitespace-pre-line">{infos.clientAdresse}</p>
                    </div>
                </div>

                <table className="w-full text-left border-collapse mb-12">
                    <thead className="border-b-2 border-black text-[10px] font-black uppercase">
                        <tr>
                            <th className="py-3">Désignation</th>
                            <th className="py-3 text-right">Montant Net</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                        {lignes.map((l) => (
                            <tr key={l.id} className="border-b border-gray-100">
                                <td className="py-6 whitespace-pre-line">{l.description}</td>
                                <td className="py-6 text-right font-black text-lg">{Number(l.montant).toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t-4 border-black pt-8 flex justify-between items-end">
                    <div className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed">
                        <p>Règlement par virement ou chèque à l'ordre de l'ASSTSF</p>
                        <p>IBAN : {infos.iban}</p>
                        <p>BIC : {infos.bic}</p>
                        <p className="mt-2">{infos.note}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm">Total : <span className="font-black">{totalFinal.toFixed(2)} €</span></p>
                        {dejaRegle > 0 && <p className="text-sm">Déjà réglé : -{dejaRegle.toFixed(2)} €</p>}
                        <p className="text-xs font-black text-blue-600 uppercase mb-2 mt-3">Reste à payer</p>
                        <div className="text-6xl font-black italic tracking-tighter">{Math.max(resteAPayer, 0).toFixed(2)} €</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
