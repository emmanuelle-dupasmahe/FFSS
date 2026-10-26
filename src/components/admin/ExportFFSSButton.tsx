"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExportFFSSButton({ data }: { data: any[] }) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            // Import dynamique : la librairie n'est chargée qu'au clic sur le bouton
            const ExcelJS = (await import("exceljs")).default;

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Licences FFSS");

            sheet.columns = [
                { header: "Nom et Prénom", key: "name", width: 30 },
                { header: "Email", key: "email", width: 32 },
                { header: "Téléphone", key: "phone", width: 16 },
                { header: "Date de Naissance", key: "birthDate", width: 18 },
                { header: "Lieu de Naissance", key: "birthPlace", width: 22 },
                { header: "Adresse", key: "address", width: 40 },
                { header: "Code Postal", key: "zipCode", width: 12 },
                { header: "Ville", key: "city", width: 22 },
                { header: "Formation", key: "formation", width: 35 },
            ];

            // Remplissage et nettoyage
            data.forEach(item => {
                // Ici, 'item' contient { user, formation }
                const user = item.user;
                const formation = item.formation;

                const clean = (value: unknown) => String(value ?? "").replace(/[\n\r]/g, " ");

                sheet.addRow({
                    name: clean(user?.name),
                    email: clean(user?.email),
                    // Téléphone et code postal en texte pour conserver les 0 en tête
                    phone: clean(user?.phone),
                    birthDate: user?.birthDate ? new Date(user.birthDate).toLocaleDateString("fr-FR") : "",
                    birthPlace: clean(user?.birthPlace),
                    address: clean(user?.address),
                    zipCode: clean(user?.zipCode),
                    city: clean(user?.city),
                    formation: clean(formation?.title || "Non spécifié"),
                });
            });

            // En-tête en gras, figé et filtrable
            sheet.getRow(1).font = { bold: true };
            sheet.views = [{ state: "frozen", ySplit: 1 }];
            sheet.autoFilter = { from: "A1", to: "I1" };
            // Force le format texte sur Téléphone (C) et Code Postal (G)
            sheet.getColumn("phone").numFmt = "@";
            sheet.getColumn("zipCode").numFmt = "@";

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const dateExport = new Date().toLocaleDateString("fr-FR").replace(/\//g, '-');
            link.setAttribute("download", `Export_Licences_FFSS_${dateExport}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } finally {
            setLoading(false);
        }
    };

    if (!data || data.length === 0) return null;

    return (
        <Button
            onClick={handleExport}
            disabled={loading}
            variant="outline"
            className="h-10 rounded-xl text-[10px] uppercase font-black px-4 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 shadow-sm"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Exporter Tableur FFSS
        </Button>
    );
}
