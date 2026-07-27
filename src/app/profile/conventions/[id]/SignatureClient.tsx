"use client";

import React, { useState } from "react";
import SignaturePad from "@/components/ui/signature-pad";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveSignature } from "@/app/actions/signature";

export default function SignatureClient({ devisId }: { devisId: string }) {
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleSave = async (base64Image: string) => {
        setIsSaving(true);
        toast.loading("Verrouillage et enregistrement de votre signature...", { id: "sig-save" });

        try {
            // Appel à notre action serveur sécurisée
            const result = await saveSignature(devisId, base64Image);

            if (result.success) {
                toast.success("Document signé avec succès !", { id: "sig-save" });
                router.refresh(); // Recharge la page instantanément pour afficher la version validée
            } else {
                toast.error(`Erreur : ${result.error}`, { id: "sig-save" });
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur technique lors de la connexion.", { id: "sig-save" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    Approbation de l'Organisateur
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    En signant ci-dessous, vous acceptez les termes de la convention et validez définitivement le dispositif prévisionnel de secours.
                </p>
            </div>

            {/* Si ça sauvegarde, on grise légèrement la zone */}
            <div className={`transition-opacity duration-300 ${isSaving ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <SignaturePad onSave={handleSave} />
            </div>
        </div>
    );
}