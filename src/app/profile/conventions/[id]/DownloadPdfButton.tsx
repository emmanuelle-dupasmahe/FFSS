"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

export default function DownloadPdfButton({ targetId, fileName }: { targetId: string, fileName: string }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // On cherche la zone de la page à transformer en PDF
            const element = document.getElementById(targetId);
            if (!element) throw new Error("Document introuvable");

            // On prend la "photo" du document avec la signature
            const imgData = await htmlToImage.toJpeg(element, {
                quality: 0.95,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                skipFonts: true
            });

            // On crée le PDF A4
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Gestion de multiples pages si la convention est longue
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(fileName);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la génération du PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            onClick={handleDownload}
            disabled={isDownloading}
            variant="outline"
            className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-100 bg-white"
        >
            {isDownloading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
            {isDownloading ? "Génération PDF en cours..." : "Télécharger une copie (PDF)"}
        </Button>
    );
}