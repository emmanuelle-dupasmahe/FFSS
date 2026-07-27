"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Printer, FileText, Landmark, User, Plus, Trash2, ArrowLeft, Mail, Loader2 } from "lucide-react";
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
import { processAndSendDpsFacture } from "@/app/actions/devis";
import { toast } from "sonner";

// 🛠️ AJOUT DES DATES (eventDate, endDate) DANS LES PROPS
export default function ClientFacture({ effectifInitial, eventTitle, eventDate, endDate, location, totalInitial, devisDpsId, devisId, id, userEmail, templateBody, organismeDemandeur, nomContact, telephoneContact }: any) {
    const router = useRouter();

    // SÉCURITÉ : On cherche l'ID partout où il pourrait être caché
    const finalId = devisDpsId || devisId || id || effectifInitial?.devisId || effectifInitial?.id || "";

    const [numFacture] = useState(`F-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

    // 💡 PRÉ-REMPLISSAGE INTELLIGENT DU CLIENT
    const [factureInfos, setFactureInfos] = useState({
        numero: numFacture,
        date: new Date().toISOString().split('T')[0],
        echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clientNom: organismeDemandeur || "Structure...",
        clientAdresse: nomContact ? `À l'attention de : ${nomContact}\nAdresse du client...` : "Adresse du client...",
        iban: "FR76 3000 4000 0012 3456 7890 123",
        note: "Exonération de TVA - Article 261-7-1 du CGI"
    });

    const [lignes, setLignes] = useState([
        { id: 1, description: `Forfait - ${eventTitle}`, montant: totalInitial }
    ]);

    const ajouterLigne = () => setLignes([...lignes, { id: Date.now(), description: "Nouvelle prestation...", montant: 0 }]);
    const supprimerLigne = (id: number) => setLignes(lignes.filter(l => l.id !== id));
    const modifierLigne = (id: number, champ: string, valeur: string | number) => {
        setLignes(lignes.map(l => l.id === id ? { ...l, [champ]: valeur } : l));
    };

    const totalFinal = lignes.reduce((acc, curr) => acc + Number(curr.montant), 0);

    // --- GESTION MODALE & ENVOI ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const texteParDefaut = templateBody
        ? templateBody.replace(/{{eventTitle}}/g, eventTitle || "").replace(/{{numero}}/g, numFacture)
        : `Bonjour,\n\nVeuillez trouver ci-joint la facture définitive n°${numFacture} concernant les prestations de secours effectuées lors de votre événement "${eventTitle}".\n\nNous vous remercions de votre confiance.`;

    const [emailBody, setEmailBody] = useState(texteParDefaut);
    const [isSending, setIsSending] = useState(false);

    const handleConfirmSend = async () => {
        setIsSending(true);
        toast.loading("Génération de la facture officielle et envoi...", { id: "send-facture" });

        if (!finalId) {
            toast.error("Erreur : L'identifiant du devis est introuvable.", { id: "send-facture" });
            setIsSending(false);
            return;
        }

        try {
            const element = document.getElementById("zone-pdf-officiel");
            if (!element) throw new Error("Feuille officielle introuvable");

            // 🪄 TOUR DE MAGIE APPAREIL PHOTO
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

            // Appel à l'action serveur mise à jour
            const result = await processAndSendDpsFacture({
                devisDpsId: finalId,
                total: totalFinal,
                customMessage: emailBody,
                pdfBase64: pdfBase64
            });

            if (result.success) {
                toast.success("Facture définitive envoyée avec succès !", { id: "send-facture" });
                setIsModalOpen(false);
            } else {
                toast.error(`Échec de l'envoi : ${result.error}`, { id: "send-facture" });
            }
        } catch (error) {
            console.error("Erreur PDF:", error);
            toast.error("Erreur lors de la génération du document.", { id: "send-facture" });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="relative">


            {/* --- CONSOLE ADMIN --- */}
            <div className="no-print grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-slate-50 dark:bg-[#001A3D] min-h-screen transition-colors">

                <div className="space-y-6 overflow-y-auto max-h-[90vh] pr-2">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors mb-2">
                        <ArrowLeft size={16} /> Retour au devis
                    </button>

                    <h2 className="text-xl font-black uppercase italic dark:text-white flex items-center gap-2">
                        <FileText className="text-blue-600" /> Console Édition Facture
                    </h2>

                    {/* LA FAMEUSE MODALE EST ICI */}
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
                                    Destinataire : {userEmail || "Client"}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Corps du message</Label>
                                <Textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    className="min-h-[200px] text-sm dark:bg-[#001A3D] border-slate-200 dark:border-white/20 rounded-xl"
                                />
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
                        <Input placeholder="Nom du client" value={factureInfos.clientNom} onChange={(e) => setFactureInfos({ ...factureInfos, clientNom: e.target.value })} className="dark:bg-[#001A3D]" />
                        <Textarea placeholder="Adresse complète" value={factureInfos.clientAdresse} onChange={(e) => setFactureInfos({ ...factureInfos, clientAdresse: e.target.value })} className="dark:bg-[#001A3D]" />
                    </div>

                    {/* Bloc Détails Facture */}
                    <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-400">N° Facture</Label>
                            <Input value={factureInfos.numero} onChange={(e) => setFactureInfos({ ...factureInfos, numero: e.target.value })} className="dark:bg-[#001A3D]" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-400">Date</Label>
                            <Input type="date" value={factureInfos.date} onChange={(e) => setFactureInfos({ ...factureInfos, date: e.target.value })} className="dark:bg-[#001A3D]" />
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
                                <Input value={ligne.description} onChange={(e) => modifierLigne(ligne.id, 'description', e.target.value)} className="flex-grow dark:bg-[#001A3D] text-xs" />
                                <Input type="number" value={ligne.montant} onChange={(e) => modifierLigne(ligne.id, 'montant', e.target.value)} className="w-24 dark:bg-[#001A3D] text-xs text-right" />
                                <Button size="icon" variant="ghost" onClick={() => supprimerLigne(ligne.id)} className="text-red-500 hover:text-red-700 h-9 w-9"><Trash2 size={14} /></Button>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Coordonnées Bancaires (RIB)</Label>
                        <Input value={factureInfos.iban} onChange={(e) => setFactureInfos({ ...factureInfos, iban: e.target.value })} className="dark:bg-[#001A3D] text-xs" />
                    </div>

                    <Button onClick={() => window.print()} className="w-full bg-slate-800 hover:bg-slate-900 h-14 rounded-2xl font-black uppercase text-white shadow-xl transition-all active:scale-95">
                        <Printer className="mr-2" /> Imprimer le PDF localement
                    </Button>
                </div>

                {/* --- APERÇU DYNAMIQUE (Feuille de droite) --- */}
                <div className="preview-paper rounded-[3rem] p-12 flex flex-col shadow-2xl sticky top-8">
                    <div className="flex justify-between items-start border-b-2 pb-8 mb-8">
                        <img src="/log_asstsf.png" alt="Logo" className="w-16 h-16 object-contain" />
                        <div className="text-right">
                            <h3 className="text-2xl font-black italic text-blue-600 uppercase">Facture</h3>
                            <p className="text-xs font-bold uppercase tracking-widest">{factureInfos.numero}</p>
                            <p className="text-[9px] text-slate-400">Émise le {new Date(factureInfos.date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Émetteur</p>
                            <p className="text-xs font-black">ASSTSF SECOURISME</p>
                            <p className="text-[9px]">Association Agréée de Sécurité Civile</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Destinataire</p>
                            <p className="text-xs font-black uppercase leading-tight">{factureInfos.clientNom}</p>
                            <p className="text-[10px] italic whitespace-pre-line">{factureInfos.clientAdresse}</p>
                        </div>
                    </div>

                    {/* 🆕 ÉVÉNEMENT (Aperçu à l'écran) */}
                    <div className="bg-slate-50 dark:bg-transparent p-4 rounded-xl text-sm space-y-1 mb-8 border border-slate-100 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Pour la manifestation :</p>
                        <p className="font-bold text-blue-600 uppercase mb-2">{eventTitle}</p>
                        <p className="text-slate-600 dark:text-slate-300">
                            📅 <span className="font-medium">
                                {eventDate ? new Date(eventDate).toLocaleDateString('fr-FR') : "Date non renseignée"}
                                {endDate ? ` au ${new Date(endDate).toLocaleDateString('fr-FR')}` : ""}
                            </span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">📍 <span className="font-medium">{location || "Non renseigné"}</span></p>
                    </div>

                    <div className="flex-grow">
                        <table className="w-full text-left">
                            <thead className="border-b text-[9px] font-black uppercase">
                                <tr>
                                    <th className="py-2">Description</th>
                                    <th className="py-2 text-right">Montant HT</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {lignes.map((l) => (
                                    <tr key={l.id} className="border-b border-slate-50">
                                        <td className="py-4 font-medium">{l.description}</td>
                                        <td className="py-4 text-right font-black">{Number(l.montant).toLocaleString()} €</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 pt-8 border-t-2">
                        <div className="flex justify-between items-end">
                            <div className="flex gap-4 items-center text-slate-400">
                                <Landmark size={20} />
                                <div className="text-[8px] font-medium leading-tight uppercase">
                                    Règlement par virement ou chèque à l'ordre de l'ASSTSF<br />
                                    IBAN : {factureInfos.iban}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 block mb-1">Net à Payer</span>
                                <div className="text-5xl font-black italic tracking-tighter">{totalFinal.toLocaleString()} €</div>
                            </div>
                        </div>
                        <p className="text-[7px] text-center text-slate-300 mt-10 uppercase font-bold">{factureInfos.note}</p>
                    </div>
                </div>
            </div>

            {/* --- FEUILLE PDF OFFICIELLE (Cachée à l'écran) --- */}
            <div id="zone-pdf-officiel" className="only-print bg-white text-black font-sans p-[15mm]">
                <div className="flex justify-between items-center border-b-4 border-black pb-8 mb-10">
                    <img src="/log_asstsf.png" alt="Logo" className="w-20 h-20 object-contain" />
                    <div className="text-right">
                        <h1 className="text-4xl font-black uppercase italic leading-none">Facture</h1>
                        <p className="text-sm font-bold mt-2">N° {factureInfos.numero}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">De :</p>
                        <p className="text-sm font-black">ASSTSF</p>
                        <p className="text-xs">Agréé Sécurité Civile</p>
                        <p className="text-xs font-bold mt-2">SIRET 411 371 422 00015</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">À :</p>
                        <p className="text-sm font-black uppercase">{factureInfos.clientNom}</p>
                        <p className="text-xs italic whitespace-pre-line">{factureInfos.clientAdresse}</p>
                    </div>
                </div>

                {/* 🆕 ÉVÉNEMENT (Sur le PDF officiel) */}
                <div className="mb-10 border-l-4 border-blue-600 pl-4 shrink-0 bg-gray-50 p-4">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Pour la manifestation :</p>
                    <h2 className="text-xl font-black uppercase mb-1">{eventTitle}</h2>
                    <p className="text-sm font-bold text-gray-800 mb-1">
                        Date(s) : {eventDate ? new Date(eventDate).toLocaleDateString('fr-FR') : "Non renseignée"}
                        {endDate ? ` au ${new Date(endDate).toLocaleDateString('fr-FR')}` : ""}
                    </p>
                    {location && <p className="text-sm text-gray-600 italic">Lieu : {location}</p>}
                </div>

                <table className="w-full text-left border-collapse mb-16">
                    <thead className="border-b-2 border-black text-[10px] font-black uppercase">
                        <tr>
                            <th className="py-3">Désignation</th>
                            <th className="py-3 text-right">Montant Net</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                        {lignes.map((l) => (
                            <tr key={l.id} className="border-b border-gray-100">
                                <td className="py-6">{l.description}</td>
                                <td className="py-6 text-right font-black text-lg">{Number(l.montant).toLocaleString()} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-auto border-t-4 border-black pt-8 flex justify-between items-end">
                    <div className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
                        <p>Règlement par virement ou chèque à l'ordre de l'ASSTSF</p>
                        <p>IBAN : {factureInfos.iban}</p>
                        <p className="mt-2">{factureInfos.note}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-blue-600 uppercase mb-2">Total à régler</p>
                        <div className="text-7xl font-black italic tracking-tighter">{totalFinal.toLocaleString()} €</div>
                    </div>
                </div>
            </div>
        </div>
    );
}