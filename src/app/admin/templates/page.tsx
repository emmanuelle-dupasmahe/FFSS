import { prisma } from "@/lib/prisma";
import { Mail, Settings } from "lucide-react";
import TemplateEditor from "@/components/admin/TemplateEditor";

export default async function AdminTemplatesPage() {
    // On récupère tous les templates existants dans la base de données
    const templates = await prisma.emailTemplate.findMany();

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-[#001A3D] transition-colors duration-300">
            <div>
                <h1 className="text-2xl md:text-3xl font-light italic uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3">
                    <Settings className="text-blue-600" />
                    MODÈLES D'E-MAILS
                </h1>
                <p className="text-[10px] md:text-xs text-blue-600 font-bold tracking-[0.3em] uppercase mt-3">
                    // Personnalisez les textes par défaut envoyés aux clients //
                </p>
            </div>

            <div className="max-w-4xl">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 p-4 rounded-2xl mb-8 flex items-start gap-4 text-sm text-blue-800 dark:text-blue-200">
                    <Mail className="mt-1 shrink-0" size={18} />
                    <p>
                        <strong>Astuce :</strong> Les textes que vous définissez ici apparaîtront automatiquement dans la fenêtre d'envoi d'e-mail.
                        Vous pourrez toujours les modifier au cas par cas juste avant de cliquer sur envoyer.
                    </p>
                </div>

                {/* On passe les données de la BDD à notre composant interactif */}
                <TemplateEditor initialTemplates={templates} />
            </div>
        </div>
    );
}