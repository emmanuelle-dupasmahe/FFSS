"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExportFFSSButton({ data }: { data: any[] }) {
    const handleExport = () => {
        const headers = ["Nom et Prénom", "Email", "Téléphone", "Date de Naissance", "Lieu de Naissance", "Adresse", "Code Postal", "Ville", "Formation"];
        const csvRows = ["sep=;", headers.join(";")];

        // 2. Remplissage et nettoyage
        data.forEach(item => {
            // Ici, 'item' contient { user, formation }
            const user = item.user;
            const formation = item.formation;

            const dateNaissance = user?.birthDate ? new Date(user.birthDate).toLocaleDateString("fr-FR") : "";
            
            const cleanName = (user?.name || "").replace(/[\n\r]/g, " ");
            const cleanAddress = (user?.address || "").replace(/[\n\r]/g, " ");
            const cleanBirthPlace = (user?.birthPlace || "").replace(/[\n\r]/g, " ");
            const cleanCity = (user?.city || "").replace(/[\n\r]/g, " ");
            const cleanFormation = (formation?.title || "Non spécifié").replace(/[\n\r]/g, " ");

            const values = [
                `"${cleanName}"`,
                `"${user?.email || ''}"`,
                `"${user?.phone || ''}"`,
                `"${dateNaissance}"`,
                `"${cleanBirthPlace}"`,
                `"${cleanAddress}"`,
                `"${user?.zipCode || ''}"`,
                `"${cleanCity}"`,
                `"${cleanFormation}"` // Ajout de la formation
            ];
            
            csvRows.push(values.join(";"));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const dateExport = new Date().toLocaleDateString("fr-FR").replace(/\//g, '-');
        link.setAttribute("download", `Export_Licences_FFSS_${dateExport}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!data || data.length === 0) return null;

    return (
        <Button 
            onClick={handleExport} 
            variant="outline" 
            className="h-10 rounded-xl text-[10px] uppercase font-black px-4 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 shadow-sm"
        >
            <Download size={14} /> Exporter Tableur FFSS
        </Button>
    );
}