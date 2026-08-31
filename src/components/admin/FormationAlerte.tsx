"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Save } from "lucide-react";
import { updateFormationAlerte } from "@/app/actions/formations";
import { toast } from "sonner";

export default function FormationAlerte({ formationId, initialAlerte = "" }: { formationId: string, initialAlerte?: string | null }) {
    const [alerte, setAlerte] = useState(initialAlerte || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateFormationAlerte(formationId, alerte);

        if (result.success) {
            toast.success("Message d'alerte sauvegardé avec succès !");
        } else {
            toast.error(result.error || "Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    return (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-4 shadow-sm mt-8">
            <div className="flex items-center gap-2 border-b border-amber-200/50 dark:border-amber-900/40 pb-4">
                <AlertTriangle className="text-amber-500" size={20} />
                <h3 className="font-black uppercase text-slate-800 dark:text-white text-sm md:text-base">
                    Message d'alerte & Conditions
                </h3>
            </div>

            <p className="text-[11px] text-slate-500 italic">
                Ce texte s'affichera en jaune sur la carte de la formation (ex: "Maintenue sous réserve de 6 inscrits"). Effacez tout le texte et enregistrez pour faire disparaître l'alerte.
            </p>

            <Textarea
                value={alerte}
                onChange={(e) => setAlerte(e.target.value)}
                placeholder="Entrez votre message personnalisé ici..."
                className="bg-white dark:bg-[#001A3D] rounded-xl border-amber-200/50 dark:border-white/10 min-h-[80px]"
            />

            <div className="flex justify-end pt-2">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-widest text-[10px] shadow-md px-6 py-5"
                >
                    {isSaving ? "Sauvegarde..." : <><Save size={14} className="mr-2" /> Enregistrer le message</>}
                </Button>
            </div>
        </div>
    );
}