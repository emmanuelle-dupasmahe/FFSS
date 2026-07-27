import { prisma } from "@/lib/prisma";
import SettingsEditor from "@/components/admin/SettingsEditor";

export default async function SettingsPage() {
    // Récupère toutes les données actuelles de la base de données
    const contents = await prisma.siteContent.findMany();

    return (
        <div className="space-y-8 pb-10">
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
                Paramètres Globaux du Site
            </h1>
            <SettingsEditor initialData={contents} />
        </div>
    );
}