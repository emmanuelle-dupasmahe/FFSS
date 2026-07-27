"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDevisDPS } from "@/app/actions/dps";
import { toast } from "sonner";

export default function DeleteDevisButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette demande de DPS ?")) {
            return;
        }

        setIsDeleting(true);
        const loadingToast = toast.loading("Suppression de la demande...");

        try {
            const result = await deleteDevisDPS(id);

            if (result?.error) {
                toast.error(result.error, { id: loadingToast });
            } else {
                toast.success("Demande supprimée avec succès !", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Une erreur technique est survenue.", { id: loadingToast });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            onClick={handleDelete}
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 rounded-xl shrink-0 border border-white/5 transition-colors"
        >
            {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                <Trash2 size={14} />
            )}
        </Button>
    );
}