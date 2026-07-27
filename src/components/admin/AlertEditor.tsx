"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Loader2, Megaphone } from "lucide-react";
import { updateSystemAlert } from "@/app/actions/alert";

export default function AlertEditor({ initialAlert }: { initialAlert: any }) {
    const [content, setContent] = useState(initialAlert?.content || "");
    const [type, setType] = useState(initialAlert?.type || "info");
    const [isActive, setIsActive] = useState(initialAlert?.isActive || false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (isActive && !content.trim()) {
            toast.error("Le contenu du bandeau ne peut pas être vide s'il est activé.");
            return;
        }

        setIsSaving(true);
        const result = await updateSystemAlert(content, type, isActive);

        if (result.success) {
            toast.success("Bandeau d'information mis à jour !");
        } else {
            toast.error("Erreur lors de la sauvegarde.");
        }
        setIsSaving(false);
    };

    return (
        <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm max-w-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-wider">
                    <Megaphone size={18} /> Statut du bandeau
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="alert-status" checked={isActive} onCheckedChange={setIsActive} />
                    <Label htmlFor="alert-status" className="font-bold text-xs uppercase cursor-pointer">
                        {isActive ? "🔴 En ligne" : "⚪ Désactivé"}
                    </Label>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message à afficher</Label>
                    <Input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Ex: Panne de chauffage à la piscine, cours annulés ce mardi..."
                        className="dark:bg-[#001A3D] border-slate-200 dark:border-white/20 font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Style d'importance</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: "info", label: "Jaune (Info)", bg: "bg-yellow-500/10 border-yellow-500 text-yellow-600" },
                            { id: "warning", label: "Rouge (Important)", bg: "bg-red-500/10 border-red-500 text-red-600" },
                            { id: "success", label: "Vert (Rétablissement)", bg: "bg-emerald-500/10 border-emerald-500 text-emerald-600" }
                        ].map((style) => (
                            <button
                                key={style.id}
                                type="button"
                                onClick={() => setType(style.id)}
                                className={`p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all ${style.bg} ${type === style.id ? 'opacity-100 scale-102 border-current shadow-sm' : 'opacity-40 hover:opacity-70'}`}
                            >
                                {style.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl uppercase font-black text-[10px] flex gap-2 h-12 mt-4"
            >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Mettre à jour le bandeau public
            </Button>
        </div>
    );
}