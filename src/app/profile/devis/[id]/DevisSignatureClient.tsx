"use client";

import React, { useState } from "react";
import SignaturePad from "@/components/ui/signature-pad";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveDevisSignature } from "@/app/actions/signature";

export default function DevisSignatureClient({ devisId }: { devisId: string }) {
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleSave = async (base64Image: string) => {
        setIsSaving(true);
        toast.loading("Enregistrement du devis...", { id: "sig-devis" });

        try {
            // On appelle l'action spécifique au devis qu'on a créée précédemment
            const result = await saveDevisSignature(devisId, base64Image);

            if (result.success) {
                toast.success("Devis financier signé avec succès !", { id: "sig-devis" });
                router.refresh();
            } else {
                toast.error(`Erreur : ${result.error}`, { id: "sig-devis" });
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur technique.", { id: "sig-devis" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 mt-8 border-t border-slate-200 pt-8">
            <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    Validation Financière
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    En signant ci-dessous, vous acceptez le devis financier pour la couverture sanitaire de votre événement.
                </p>
            </div>

            <div className={`transition-opacity duration-300 ${isSaving ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <SignaturePad onSave={handleSave} />
            </div>
        </div>
    );
}