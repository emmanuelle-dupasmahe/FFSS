import { prisma } from "@/lib/prisma";
import { Megaphone } from "lucide-react";
import AlertEditor from "@/components/admin/AlertEditor";

export default async function AdminAlertPage() {
    const alert = await prisma.systemAlert.findUnique({
        where: { id: "main-alert" }
    });

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-[#001A3D] transition-colors duration-300">
            <div>
                <h1 className="text-2xl md:text-3xl font-light italic uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3">
                    <Megaphone className="text-blue-600" />
                    BANDEAU D'ANNONCE
                </h1>
                <p className="text-[10px] md:text-xs text-blue-600 font-bold tracking-[0.3em] uppercase mt-3">
                    // Diffusez un message d'information important en haut du site public //
                </p>
            </div>

            <AlertEditor initialAlert={alert} />
        </div>
    );
}