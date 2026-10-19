"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Landmark, Save, Loader2 } from "lucide-react";
import { updateSiteSettings } from "@/app/actions/settings";

export default function IbanSettingsForm({ ibanActuel }: { ibanActuel?: string }) {
    const [iban, setIban] = useState(ibanActuel || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateSiteSettings({ "IBAN_ASSO": iban });

        if (result.success) {
            toast.success("L'IBAN a été mis à jour avec succès !");
        } else {
            toast.error("Erreur lors de l'enregistrement de l'IBAN.");
        }
        setIsSaving(false);
    };

    return (
        <div className="p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 mb-4">
                <Landmark size={20} />
                <h3 className="text-lg font-black uppercase italic">Coordonnées Bancaires</h3>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400">IBAN de l'association (Affiché sur devis et factures)</Label>
                <Input
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="FR76 ..."
                    className="font-mono dark:bg-[#001A3D]"
                />
            </div>

            <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl uppercase font-black text-[10px] h-12"
            >
                {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                Enregistrer le nouvel IBAN
            </Button>
        </div>
    );
}