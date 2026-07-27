"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { processAndSendDpsChiffrage } from "@/app/actions/devis";
import { toast } from "sonner";
import { Printer, Tent, Car, Clock, Banknote, Mail, Loader2, Plus, Trash2 } from "lucide-react";
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

export default function ClientChiffrage({ effectifInitial, eventTitle, eventDate, endDate, location, devisDpsId, devisId, id, userEmail, templateBody, organismeDemandeur, nomContact, telephoneContact, fournitLocal }: any) {
    const finalId = devisDpsId || devisId || id || effectifInitial?.devisId || effectifInitial?.id || "";

    // --- ÉTATS LOGISTIQUES DE BASE ---
    const [duree, setDuree] = useState(8);
    const [jours, setJours] = useState(1);
    const [tarifHoraire, setTarifHoraire] = useState(17);
    const [distance, setDistance] = useState(0);
    const [hasTente, setHasTente] = useState(fournitLocal ? false : true);
    const [isHorsZone, setIsHorsZone] = useState(false);

    const effectifPersonnel = (effectifInitial?.effectif || effectifInitial || 0);

    // --- GESTION DES LIGNES DU DEVIS (ÉDITABLES) ---
    const [lignes, setLignes] = useState<any[]>([]);

    useEffect(() => {
        const heuresPrestation = (Number(duree) + 1) * Number(jours);
        let nouvellesLignes = [
            {
                id: 1,
                description: `Forfait Dispositif Secours (${heuresPrestation}h x ${effectifPersonnel} intervenants)`,
                quantite: 1,
                prixUnitaire: effectifPersonnel * heuresPrestation * tarifHoraire,
                remisePct: 0
            }
        ];

        if (isHorsZone && distance > 0) {
            nouvellesLignes.push({
                id: 2,
                description: `Participation Frais Déplacement (${distance} km)`,
                quantite: 1,
                prixUnitaire: Number(distance) * 0.60,
                remisePct: 0
            });
        }

        if (hasTente) {
            nouvellesLignes.push({
                id: 3,
                description: "Logistique structure (Tente de secours)",
                quantite: 1,
                prixUnitaire: 50,
                remisePct: 0
            });
        }
        setLignes(nouvellesLignes);
    }, [duree, jours, distance, hasTente, isHorsZone, effectifPersonnel, tarifHoraire]);

    const ajouterLigne = () => setLignes([...lignes, { id: Date.now(), description: "Nouvelle prestation...", quantite: 1, prixUnitaire: 0, remisePct: 0 }]);
    const supprimerLigne = (id: number) => setLignes(lignes.filter(l => l.id !== id));
    const modifierLigne = (id: number, champ: string, valeur: string | number) => {
        setLignes(lignes.map(l => l.id === id ? { ...l, [champ]: valeur } : l));
    };

    const totalHT = lignes.reduce((acc, l) => acc + (l.quantite * l.prixUnitaire), 0);
    const totalRemise = lignes.reduce((acc, l) => acc + (l.quantite * l.prixUnitaire * (l.remisePct / 100)), 0);
    const totalGeneral = totalHT - totalRemise;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const texteParDefaut = templateBody
        ? templateBody.replace(/{{eventTitle}}/g, eventTitle || "")
        : `Bonjour,\n\nVeuillez trouver ci-joint l'estimation budgétaire pour le dispositif de secours de votre événement "${eventTitle}".\n\nNous restons à votre disposition.`;

    const [emailBody, setEmailBody] = useState(texteParDefaut);
    const [isSending, setIsSending] = useState(false);

    const handleConfirmSend = async () => {
        setIsSending(true);
        toast.loading("Création du PDF officiel et envoi du chiffrage...", { id: "send-chiffrage" });

        if (!finalId) {
            toast.error("Erreur critique : L'identifiant du devis est introuvable.", { id: "send-chiffrage" });
            setIsSending(false);
            return;
        }

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

            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
            const pdfBase64 = pdf.output("datauristring");

            const result = await processAndSendDpsChiffrage({
                devisDpsId: finalId,
                total: totalGeneral,
                customMessage: emailBody,
                pdfBase64: pdfBase64
            });

            if (result.success) {
                toast.success("Chiffrage budgétaire envoyé avec succès !", { id: "send-chiffrage" });
                setIsModalOpen(false);
            } else {
                toast.error(`Erreur : ${result.error}`, { id: "send-chiffrage" });
            }
        } catch (error) {
            console.error("Erreur PDF:", error);
            toast.error("Erreur lors de la génération du document.", { id: "send-chiffrage" });
        } finally {
            setIsSending(false);
        }
    };
    const handleDownloadPDF = async () => {
        toast.loading("Génération du PDF en cours...", { id: "dl-pdf" });
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
                quality: 0.95,
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

            // Télécharge le fichier sur l'ordinateur
            pdf.save(`Devis_${eventTitle ? eventTitle.replace(/\s+/g, '_') : 'ASSTSF'}.pdf`);

            toast.success("PDF téléchargé avec succès !", { id: "dl-pdf" });
        } catch (error) {
            console.error("Erreur PDF:", error);
            toast.error("Erreur lors du téléchargement.", { id: "dl-pdf" });
        }
    };

    return (
        <div className="relative">
            <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8 bg-slate-50 dark:bg-[#001A3D] min-h-screen items-start">

                {/* --- CONSOLE D'ÉDITION --- */}
                <div className="lg:col-span-5 space-y-6 min-w-0 w-full">
                    <h2 className="text-xl font-black uppercase italic dark:text-white flex items-center gap-2 mb-6">
                        <Banknote className="text-blue-600" /> Éditeur Devis DPS
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1 sm:col-span-2 p-4 bg-white dark:bg-[#001A3D]/40 rounded-3xl border border-slate-200 dark:border-white/10 space-y-3">
                            <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px]">
                                <Clock size={14} /> Mission & Base Tarifaire
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Durée (h)</Label>
                                    <Input type="number" value={duree} onChange={(e) => setDuree(Number(e.target.value))} className="h-8 text-xs font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Jours</Label>
                                    <Input type="number" value={jours} onChange={(e) => setJours(Number(e.target.value))} className="h-8 text-xs font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Tarif/h (€)</Label>
                                    <Input type="number" value={tarifHoraire} onChange={(e) => setTarifHoraire(Number(e.target.value))} className="h-8 text-xs font-bold text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-[#001A3D]/40 rounded-3xl border border-slate-200 dark:border-white/10 space-y-3">
                            <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px]">
                                <Car size={14} /> Trajet
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="zone" checked={isHorsZone} onCheckedChange={(v: any) => setIsHorsZone(v)} />
                                <Label htmlFor="zone" className="text-[10px]">Hors zone</Label>
                            </div>
                            {isHorsZone && (
                                <Input type="number" value={distance} onChange={(e) => setDistance(Number(e.target.value))} placeholder="Distance AR (km)" className="h-8 text-xs" />
                            )}
                        </div>

                        <div className="p-4 bg-white dark:bg-[#001A3D]/40 rounded-3xl border border-slate-200 dark:border-white/10 space-y-3">
                            <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px]">
                                <Tent size={14} /> Tente
                            </div>
                            <div className="flex items-center space-x-2 mt-4">
                                <Checkbox id="tente" checked={hasTente} onCheckedChange={(v: any) => setHasTente(v)} />
                                <Label htmlFor="tente" className="text-[10px]">Option Tente</Label>
                            </div>
                        </div>
                    </div>

                    {/* Bloc Lignes Éditables */}
                    <div className="p-6 bg-white dark:bg-[#001A3D]/40 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase text-slate-500">Lignes (Modifiables)</Label>
                            <Button size="sm" variant="outline" onClick={ajouterLigne} className="h-7 text-[9px] uppercase font-black">
                                <Plus size={12} className="mr-1" /> Ajouter
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {/*  REPARTITION CORRIGÉE POUR CORRESPONDRE EXACTEMENT AUX CASES (4 - 1 - 3 - 4) */}
                            <div className="grid grid-cols-12 gap-1 text-[8px] font-bold text-slate-400 uppercase px-1">
                                <div className="col-span-4">Désignation</div>
                                <div className="col-span-1 text-center">Qté</div>
                                <div className="col-span-3 text-center">P.U (€)</div>
                                <div className="col-span-4 text-center">Rem. (%)</div>
                            </div>
                            {lignes.map((l) => (
                                <div key={l.id} className="grid grid-cols-12 gap-1 items-start">
                                    <Textarea
                                        value={l.description}
                                        onChange={(e) => modifierLigne(l.id, 'description', e.target.value)}
                                        className="col-span-4 text-[10px] dark:bg-[#001A3D] min-h-[40px] resize-none px-2"
                                    />
                                    <Input
                                        type="number"
                                        value={l.quantite === 0 ? '' : l.quantite}
                                        placeholder="0"
                                        onChange={(e) => modifierLigne(l.id, 'quantite', e.target.value === '' ? 0 : Number(e.target.value))}
                                        className="col-span-1 text-[10px] text-center dark:bg-[#001A3D] px-1"
                                    />
                                    <Input
                                        type="number"
                                        value={l.prixUnitaire === 0 ? '' : l.prixUnitaire}
                                        placeholder="0"
                                        onChange={(e) => modifierLigne(l.id, 'prixUnitaire', e.target.value === '' ? 0 : Number(e.target.value))}
                                        className="col-span-3 text-[10px] text-center dark:bg-[#001A3D] px-1"
                                    />
                                    <div className="col-span-4 flex gap-1 items-center">
                                        <Input
                                            type="number"
                                            value={l.remisePct === 0 ? '' : l.remisePct}
                                            placeholder="0"
                                            onChange={(e) => modifierLigne(l.id, 'remisePct', e.target.value === '' ? 0 : Number(e.target.value))}
                                            className="w-full text-[10px] text-center dark:bg-[#001A3D] px-1"
                                        />
                                        <button onClick={() => supprimerLigne(l.id)} className="text-red-500 hover:text-red-700 transition-colors p-1 shrink-0">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest text-white shadow-xl transition-all">
                                    <Mail className="mr-2" size={16} /> Envoyer
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#001A3D] border-slate-200 dark:border-white/10 rounded-[2rem]">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black uppercase italic text-blue-600">Validation de l'envoi</DialogTitle>
                                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">Destinataire : {userEmail}</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Corps du message</Label>
                                    <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="min-h-[200px] text-sm dark:bg-[#001A3D] border-slate-200 dark:border-white/20 rounded-xl" />
                                </div>
                                <DialogFooter className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl uppercase font-black text-[10px]">Annuler</Button>
                                    <Button onClick={handleConfirmSend} disabled={isSending} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 uppercase font-black text-[10px] flex gap-2">
                                        {isSending ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />} Confirmer l'envoi
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button onClick={handleDownloadPDF} variant="outline" className="h-14 rounded-2xl group relative">
                            <Printer size={18} className="group-hover:text-blue-600 transition-colors" />
                        </Button>
                    </div>
                </div>

                {/* --- APERÇU ÉCRAN --- */}
                <div className="lg:col-span-7 min-w-0 w-full overflow-x-auto preview-paper bg-white rounded-[3rem] p-8 md:p-12 flex flex-col shadow-2xl sticky top-8 print:text-black print:bg-white text-slate-900 min-h-[800px]">
                    <div className="flex justify-between items-start border-b-2 pb-8 mb-8 border-slate-200">
                        <img src="/log_asstsf.png" alt="Logo" className="w-16 h-16 object-contain" />
                        <div className="text-right">
                            <h3 className="text-2xl font-black italic text-blue-600 uppercase">Devis Estimatif</h3>
                            <p className="text-[9px] font-bold text-gray-500 uppercase">Association Agréée Sécurité Civile</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="text-xs text-gray-600">
                            <p className="font-black text-black uppercase mb-1">ASSTSF</p>
                            <p>Agréé Sécurité Civile - FFSS</p>
                            <p>Six-Fours-les-Plages</p>
                        </div>
                        <div className="text-right border-r-4 border-blue-600 pr-4 bg-gray-50 p-4">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Devis à l'attention de :</p>
                            <p className="font-black text-sm uppercase text-black">{organismeDemandeur || "Non renseigné"}</p>
                            <p className="text-xs mt-1 text-gray-700">{nomContact}</p>
                            <p className="text-xs text-gray-700">{userEmail}</p>
                        </div>
                    </div>

                    <div className="mb-8 border-l-4 border-blue-600 pl-4 bg-gray-50 p-4">
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Pour la manifestation :</p>
                        <h2 className="text-xl font-black uppercase mb-1">{eventTitle}</h2>
                        <p className="text-sm font-bold text-gray-800 mb-1">Date : {eventDate ? new Date(eventDate).toLocaleDateString('fr-FR') : ""} {endDate ? ` au ${new Date(endDate).toLocaleDateString('fr-FR')}` : ""}</p>
                        <p className="text-sm text-gray-600 italic">Lieu : {location}</p>
                    </div>

                    <div className="flex-grow">
                        <table className="w-full text-left">
                            <thead className="border-b text-[9px] font-black uppercase border-slate-200">
                                <tr>
                                    <th className="py-2">Désignation</th>
                                    <th className="py-2 text-center">Qté</th>
                                    <th className="py-2 text-right">P.U</th>
                                    <th className="py-2 text-right">Remise</th>
                                    <th className="py-2 text-right">Total Net</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {lignes.map((l) => (
                                    <tr key={l.id} className="border-b border-slate-50">
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

                    <div className="mt-8 pt-6 border-t-2 border-slate-200">
                        <div className="flex justify-between items-end">
                            <div className="text-[10px] uppercase font-bold text-slate-400">
                                {totalRemise > 0 && <p className="text-emerald-600">Économie réalisée : {totalRemise.toFixed(2)} €</p>}
                                <p className="mt-2 text-[8px] text-gray-400 normal-case">*Ce document est une estimation tarifaire indicative et ne vaut pas convention.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 block mb-1">Total Net Estimé</span>
                                <div className="text-4xl font-black italic tracking-tighter">{totalGeneral.toFixed(2)} €</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FEUILLE PDF OFFICIELLE --- */}
            <div id="zone-pdf-officiel" className="only-print flex flex-col p-[15mm] box-border bg-white text-black font-sans">
                <div className="flex justify-between items-center border-b-4 border-black pb-6 mb-8 shrink-0">
                    <img src="/log_asstsf.png" alt="Logo" className="w-20 h-20 object-contain" />
                    <div className="text-right">
                        <h1 className="text-3xl font-black uppercase italic">Devis Estimatif</h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Association Agréée Sécurité Civile</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8 shrink-0">
                    <div className="text-xs text-gray-600">
                        <p className="font-black text-black uppercase mb-1">ASSTSF</p>
                        <p>Agréé Sécurité Civile - FFSS</p>
                        <p>Six-Fours-les-Plages</p>
                    </div>
                    <div className="text-right border-r-4 border-blue-600 pr-4 bg-gray-50 p-4">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Devis à l'attention de :</p>
                        <p className="font-black text-sm uppercase text-black">{organismeDemandeur || "Organisme non renseigné"}</p>
                        <p className="text-xs mt-1 text-gray-700">{nomContact || ""}</p>
                        <p className="text-xs text-gray-700">{telephoneContact || ""}</p>
                        <p className="text-xs text-gray-700">{userEmail || ""}</p>
                    </div>
                </div>

                <div className="mb-8 border-l-4 border-blue-600 pl-4 shrink-0 bg-gray-50 p-4">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Pour la manifestation :</p>
                    <h2 className="text-xl font-black uppercase mb-1">{eventTitle}</h2>
                    <p className="text-sm font-bold text-gray-800 mb-1">Date(s) : {eventDate ? new Date(eventDate).toLocaleDateString('fr-FR') : "Non renseignée"} {endDate ? ` au ${new Date(endDate).toLocaleDateString('fr-FR')}` : ""}</p>
                    <p className="text-sm text-gray-600 italic">Lieu : {location}</p>
                </div>

                <table className="w-full text-left border-collapse mt-8 shrink-0">
                    <thead className="border-b-2 border-black text-[10px] font-black uppercase">
                        <tr>
                            <th className="py-2">Désignation</th>
                            <th className="py-2 text-center">Qté</th>
                            <th className="py-2 text-right">P.U</th>
                            <th className="py-2 text-right">Remise</th>
                            <th className="py-2 text-right">Montant Net</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {lignes.map((l) => (
                            <tr key={l.id} className="border-b border-gray-100">
                                <td className="py-4 font-bold whitespace-pre-line">{l.description}</td>
                                <td className="py-4 text-center">{l.quantite}</td>
                                <td className="py-4 text-right">{l.prixUnitaire} €</td>
                                <td className="py-4 text-right">{l.remisePct > 0 ? `-${l.remisePct}%` : '-'}</td>
                                <td className="py-4 text-right font-black">{(l.quantite * l.prixUnitaire * (1 - l.remisePct / 100)).toFixed(2)} €</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-8 border-t-4 border-black pt-6 flex justify-between items-start shrink-0">
                    <div className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed text-left">
                        <p>SIRET 411 371 422 00015</p>
                        <p>EXONÉRATION TVA - ART. 261-7-1 DU CGI</p>
                        <p>VALIDITÉ : 30 JOURS</p>
                        {totalRemise > 0 && <p className="mt-2 text-emerald-600 font-black">Total remises accordées : -{totalRemise.toFixed(2)} €</p>}
                        <p className="mt-4 text-black italic normal-case">*Ce document est une estimation tarifaire indicative et ne vaut pas convention.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-blue-600 uppercase mb-1">Total Net Estimé</p>
                        <div className="text-6xl font-black italic tracking-tighter">{totalGeneral.toFixed(2)} €</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mt-auto pt-8 border-t-2 border-black shrink-0">
                    <div>
                        <p className="text-[10px] font-black uppercase underline italic mb-12">Le Client / L'Organisateur :</p>
                        <p className="text-[8px] text-gray-500 italic mt-8">Mention "Bon pour accord", date et signature</p>
                    </div>
                    <div className="relative">
                        <p className="text-[10px] font-black uppercase underline italic mb-2">L'Association ASSTSF :</p>
                        <p className="text-[8px] text-gray-500 italic mb-2">Devis émis le {new Date().toLocaleDateString('fr-FR')}</p>
                        <div className="relative h-24 mt-2">
                            <img src="/cachet-asso.png" alt="Cachet ASSTSF" className="absolute top-0 left-0 w-48 h-48 object-contain opacity-80" />
                            <img src="/pres.png" alt="Signature Président" className="absolute top-4 left-12 w-32 h-16 object-contain mix-blend-multiply" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}