import { prisma } from "@/lib/prisma";
import SettingsEditor from "@/components/admin/SettingsEditor";
import IbanSettingsForm from "@/components/admin/IbanSettingsForm"; // 🪛 NOUVEL IMPORT

export default async function SettingsPage() {
    // Récupère toutes les données actuelles de la base de données
    const contents = await prisma.siteContent.findMany();

    // 🪛 On extrait spécifiquement la valeur de l'IBAN depuis les résultats
    const ibanRecord = contents.find(item => item.key === "IBAN_ASSO");

    return (
        <div className="space-y-8 pb-10">
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
                Paramètres Globaux du Site
            </h1>

            {/* 🪛 NOUVEAU : On affiche notre bloc bancaire */}
            <IbanSettingsForm ibanActuel={ibanRecord?.value || ""} />

            {/* Ton éditeur classique reste intact en dessous */}
            <SettingsEditor initialData={contents} />
        </div>
    );
}