"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteInscription } from "@/app/actions/formations";
import { toast } from "sonner";

export default function DeleteInscriptionButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement ce dossier de formation ?")) {
            return;
        }

        setIsDeleting(true);
        const loadingToast = toast.loading("Suppression du dossier...");

        try {
            const result = await deleteInscription(id);

            if (result?.error) {
                toast.error(result.error, { id: loadingToast });
            } else {
                toast.success("Dossier supprimé avec succès !", { id: loadingToast });
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
            className="rounded-xl bg-slate-100 dark:bg-white/5 text-red-500 hover:bg-red-500 hover:text-white transition-all hover:scale-110 shrink-0"
        >
            {isDeleting ? (
                <Loader2 size={20} className="animate-spin" />
            ) : (
                <Trash2 size={20} />
            )}
        </Button>
    );
}