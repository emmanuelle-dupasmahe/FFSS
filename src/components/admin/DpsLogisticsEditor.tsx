"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { updateDpsLogistics } from "@/app/actions/devis";
import { toast } from "sonner";

export default function DpsLogisticsEditor({ devis }: { devis: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        expectedPublic: devis.expectedPublic || 0,
        superficie: devis.superficie || "",
        distanceMaxi: devis.distanceMaxi || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "expectedPublic" ? Number(value) : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateDpsLogistics(devis.id, formData);
        if (result.success) {
            toast.success("Informations logistiques mises à jour !");
            setIsEditing(false);
        } else {
            toast.error("Erreur lors de la mise à jour.");
        }
        setIsSaving(false);
    };

    if (!isEditing) {
        return (
            <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm relative group transition-all">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Edit2 size={16} className="text-slate-400 hover:text-blue-600" />
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pr-8">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Public attendu (P1)</p>
                        <p className="font-black text-sm text-slate-900 dark:text-white">{devis.expectedPublic?.toLocaleString() || "0"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Superficie</p>
                        <p className="font-black text-sm text-slate-900 dark:text-white">{devis.superficie || "Non renseignée"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Distance maximale</p>
                        <p className="font-black text-sm text-slate-900 dark:text-white">{devis.distanceMaxi || "Non renseignée"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Abri fourni</p>
                        <p className={`text-sm font-black uppercase tracking-wider ${devis.fournitLocal ? "text-emerald-500" : "text-amber-500"}`}>
                            {devis.fournitLocal ? "Oui (Poste)" : "Non (Tente)"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-[#001A3D] p-6 rounded-3xl border border-blue-200 dark:border-blue-900 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-black uppercase text-blue-600 tracking-widest">Modifier la logistique</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    <X size={16} />
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Public attendu (Chiffre exact)</Label>
                    <Input type="number" name="expectedPublic" value={formData.expectedPublic} onChange={handleChange} className="bg-white dark:bg-white/5" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Superficie (ex: 2000 m2)</Label>
                    <Input type="text" name="superficie" value={formData.superficie} onChange={handleChange} className="bg-white dark:bg-white/5" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Distance max. (ex: 500m)</Label>
                    <Input type="text" name="distanceMaxi" value={formData.distanceMaxi} onChange={handleChange} className="bg-white dark:bg-white/5" />
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase h-10 px-6">
                    {isSaving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                    Enregistrer et Recalculer
                </Button>
            </div>
        </div>
    );
}