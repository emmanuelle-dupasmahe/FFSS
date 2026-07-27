"use client";

import { useState } from "react";
import { updateInscriptionStatus } from "@/app/actions/inscriptions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function InscriptionStatusSelect({ id, currentStatus }: { id: string, currentStatus: string }) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setIsUpdating(true);
        const newStatus = e.target.value;
        const result = await updateInscriptionStatus(id, newStatus);

        if (result.success) {
            toast.success("Statut mis à jour !");
        } else {
            toast.error("Erreur lors de la mise à jour");
        }
        setIsUpdating(false);
    };

    return (
        <div className="flex items-center gap-2">
            {isUpdating && <Loader2 size={12} className="animate-spin text-blue-500" />}
            <select
                value={currentStatus}
                onChange={handleChange}
                disabled={isUpdating}
                className={`text-[10px] font-black uppercase italic rounded-md px-2 py-1 cursor-pointer border-none outline-none appearance-none pr-6 bg-transparent
                    ${currentStatus === "VALIDEE" ? "text-emerald-600 bg-emerald-500/10" :
                        currentStatus === "TRAITE" ? "text-amber-500 bg-amber-500/10" :
                            currentStatus === "ANNULE" ? "text-red-500 bg-red-500/10" :
                                "text-blue-500 bg-blue-500/10"}`}
            >
                {/* 🪛 Les "value" ont été corrigées pour correspondre exactement à la base de données */}
                <option value="ATTENTE">En Attente (Liste)</option>
                <option value="TRAITE">Traité</option>
                <option value="VALIDEE">Validé</option>
                <option value="ANNULE">Annulé</option>
            </select>
        </div>
    );
}