"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { processAndSendDpsRisAndConv } from "@/app/actions/devis";

export default function SendEmailButton({ devisId, email, eventTitle, templateBody }: { devisId: string, email?: string, eventTitle?: string, templateBody?: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Texte par défaut adapté pour inclure la mention de la convention
    const texteParDefaut = templateBody
        ? templateBody.replace(/{{eventTitle}}/g, eventTitle || "")
        : `Bonjour,\n\nVeuillez trouver ci-joint la fiche de dimensionnement (Analyse RIS) ainsi que la convention correspondante concernant la couverture de votre événement "${eventTitle || ''}".\n\nNous vous invitons à prendre connaissance de ces documents et à nous retourner un exemplaire signé de la convention.\n\nNous restons à votre disposition.`;

    const [emailBody, setEmailBody] = useState(texteParDefaut);
    const [isSending, setIsSending] = useState(false);

    const handleConfirmSend = async () => {
        setIsSending(true);
        toast.loading("Génération des documents et envoi de l'e-mail...", { id: "send-all" });

        try {
            // =================================================================
            // 1. CAPTURE DE LA FICHE RIS
            // =================================================================
            const elementRis = document.getElementById("zone-pdf-officiel");
            if (!elementRis) throw new Error("Feuille officielle RIS introuvable");

            const originalClassRis = elementRis.className;

            // 🛠️ CORRECTION : On retire les deux classes pour s'assurer que l'élément est visible par l'appareil photo
            elementRis.classList.remove("only-print");
            elementRis.classList.remove("hidden");

            // On applique les styles nécessaires au rendu
            elementRis.style.display = "flex";
            elementRis.style.flexDirection = "column";
            elementRis.style.width = "210mm";
            elementRis.style.minHeight = "297mm"; // 📏 minHeight permet à la page de s'allonger avec tes nouveaux espaces
            elementRis.style.position = "absolute";
            elementRis.style.top = "0";
            elementRis.style.left = "0";
            elementRis.style.zIndex = "-9999";
            elementRis.style.backgroundColor = "#ffffff";
            elementRis.style.boxSizing = "border-box";

            // Petite pause de sécurité pour laisser le navigateur injecter les styles
            await new Promise((resolve) => setTimeout(resolve, 100));

            const imgDataRis = await htmlToImage.toJpeg(elementRis, {
                quality: 0.9,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                skipFonts: true
            });

            // 🧹 NETTOYAGE IMMÉDIAT
            elementRis.style.cssText = "";
            elementRis.className = originalClassRis;

            const pdfRis = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

            // Calcul proportionnel pour ne pas écraser les espaces verticalement
            const pdfWidthRis = pdfRis.internal.pageSize.getWidth();
            const imgPropsRis = pdfRis.getImageProperties(imgDataRis);
            const imgHeightRis = (imgPropsRis.height * pdfWidthRis) / imgPropsRis.width;

            pdfRis.addImage(imgDataRis, "JPEG", 0, 0, pdfWidthRis, imgHeightRis);
            const pdfRisBase64 = pdfRis.output("datauristring");

            // =================================================================
            // 2. CAPTURE DE LA CONVENTION
            // =================================================================
            const elementConv = document.getElementById("zone-pdf-convention");
            if (!elementConv) throw new Error("Zone PDF Convention introuvable. Veuillez vérifier son ID.");

            const originalClassConv = elementConv.className;
            elementConv.classList.remove("hidden");
            elementConv.style.width = "210mm";
            elementConv.style.position = "fixed";
            elementConv.style.top = "0";
            elementConv.style.left = "0";
            elementConv.style.zIndex = "-9999";
            elementConv.style.backgroundColor = "#ffffff";

            const imgDataConv = await htmlToImage.toJpeg(elementConv, { quality: 0.8, pixelRatio: 2, backgroundColor: '#ffffff', skipFonts: true });

            elementConv.style.cssText = "";
            elementConv.className = originalClassConv;

            const pdfConv = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const pdfWidth = pdfConv.internal.pageSize.getWidth();
            const pdfHeight = pdfConv.internal.pageSize.getHeight();
            const imgProps = pdfConv.getImageProperties(imgDataConv);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdfConv.addImage(imgDataConv, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdfConv.addPage();
                pdfConv.addImage(imgDataConv, 'JPEG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            const pdfConvBase64 = pdfConv.output("datauristring");

            // =================================================================
            // 3. ENVOI AU SERVEUR VIA FORMDATA
            // =================================================================
            const formData = new FormData();
            formData.append("devisId", devisId);
            formData.append("message", emailBody);
            formData.append("risPdf", pdfRisBase64);
            formData.append("convPdf", pdfConvBase64);

            const result = await processAndSendDpsRisAndConv(formData);

            if (result.success) {
                toast.success("Dossier complet envoyé avec succès !", { id: "send-all" });
                setIsModalOpen(false);
            } else {
                toast.error(`Erreur : ${result.error}`, { id: "send-all" });
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la génération ou de l'envoi.", { id: "send-all" });
        } finally {
            setIsSending(false);
        }
    };

    // =================================================================
    // 4. INTERFACE UTILISATEUR
    // =================================================================
    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer">
                    <Mail size={16} /> Envoyer RIS & Convention
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#001A3D] border-slate-200 dark:border-white/10 rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase italic text-blue-600">
                        Envoi du Dossier Officiel
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">
                        Destinataire : {email || "Client"}
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
    );
}