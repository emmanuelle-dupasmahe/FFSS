"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Loader2, Info } from "lucide-react";
import { updateEmailTemplate } from "@/app/actions/templates";

const TEMPLATE_TYPES = [
    { id: "RIS", title: "Fiche d'Analyse RIS & CONVENTION", vars: "{{eventTitle}}" },
    { id: "CHIFFRAGE", title: "Devis Estimatif", vars: "{{eventTitle}}" },
    { id: "FACTURE", title: "Facture Définitive", vars: "{{eventTitle}}, {{numero}}" },
    { id: "FORMATION", title: "Devis Formation", vars: "{{formationName}}, {{clientName}}" }
];

export default function TemplateEditor({ initialTemplates }: { initialTemplates: any[] }) {
    // On initialise le state avec les données de la BDD ou des valeurs par défaut
    const [templates, setTemplates] = useState<Record<string, { subject: string, body: string }>>(() => {
        const state: Record<string, { subject: string, body: string }> = {};
        TEMPLATE_TYPES.forEach(t => {
            const found = initialTemplates.find(dbTemp => dbTemp.type === t.id);
            state[t.id] = {
                subject: found?.subject || `Document pour {{eventTitle}}`,
                body: found?.body || `Bonjour,\n\nVeuillez trouver ci-joint le document concernant {{eventTitle}}.\n\nCordialement,`
            };
        });
        return state;
    });

    const [isSaving, setIsSaving] = useState<string | null>(null);

    const handleSave = async (type: string) => {
        setIsSaving(type);
        const data = templates[type];

        const result = await updateEmailTemplate(type, data.subject, data.body);

        if (result.success) {
            toast.success("Modèle mis à jour avec succès !");
        } else {
            toast.error("Erreur lors de la sauvegarde.");
        }
        setIsSaving(null);
    };

    return (
        <div className="space-y-8">
            {TEMPLATE_TYPES.map((templateType) => (
                <div key={templateType.id} className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-black uppercase italic text-blue-600">{templateType.title}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <Info size={14} /> Variables magiques disponibles : <span className="font-bold text-slate-700 dark:text-slate-300">{templateType.vars}</span>
                            </p>
                        </div>
                        <Button
                            onClick={() => handleSave(templateType.id)}
                            disabled={isSaving === templateType.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl uppercase font-black text-[10px] flex gap-2 h-10"
                        >
                            {isSaving === templateType.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Sauvegarder
                        </Button>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sujet de l'e-mail</Label>
                            <Input
                                value={templates[templateType.id].subject}
                                onChange={(e) => setTemplates({ ...templates, [templateType.id]: { ...templates[templateType.id], subject: e.target.value } })}
                                className="dark:bg-[#001A3D] border-slate-200 dark:border-white/20 font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Corps du message (Texte par défaut)</Label>
                            <Textarea
                                value={templates[templateType.id].body}
                                onChange={(e) => setTemplates({ ...templates, [templateType.id]: { ...templates[templateType.id], body: e.target.value } })}
                                className="min-h-[150px] dark:bg-[#001A3D] border-slate-200 dark:border-white/20 text-sm leading-relaxed"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}