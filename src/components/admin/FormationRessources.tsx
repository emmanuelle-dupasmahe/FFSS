"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, PlayCircle, Trash2, Plus, Save } from "lucide-react";
import { updateFormationRessources } from "@/app/actions/formations";
import { UploadButton } from "@/lib/uploadthing";

export default function FormationRessources({ formationId, initialRessources = [] }: { formationId: string, initialRessources?: any[] }) {
    const [ressources, setRessources] = useState(initialRessources);
    const [isSaving, setIsSaving] = useState(false);

    const handleAdd = () => {
        setRessources([
            ...ressources,
            { id: `temp-${Date.now()}`, title: "", url: "", type: "PDF" }
        ]);
    };

    const handleRemove = (id: string) => {
        setRessources(ressources.filter(r => r.id !== id));
    };

    const handleChange = (id: string, field: string, value: string) => {
        setRessources(ressources.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave = ressources.map(r => {
                const { id, ...rest } = r;
                return r.id.startsWith('temp-') ? rest : r;
            });
            await updateFormationRessources(formationId, dataToSave);
            alert("Ressources sauvegardées avec succès !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        /* 🔵 LE CONTENEUR PASSE EN FOND BLEUTÉ DIRECTEMENT */
        <div className="bg-blue-50/30 dark:bg-blue-950/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-blue-100/50 dark:border-blue-900/20 pb-4">
                <h3 className="font-black uppercase text-slate-800 dark:text-white flex items-center gap-2 text-sm md:text-base">
                    <FileText className="text-blue-600 animate-bounce" size={20} />
                    Documents & Ressources
                </h3>
                <Button onClick={handleAdd} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-[10px] font-bold uppercase shadow-md transition-transform hover:scale-105">
                    <Plus size={14} className="mr-1" /> Ajouter un document
                </Button>
            </div>

            {ressources.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-8 bg-white/50 dark:bg-black/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Aucun document n'est lié à cette formation. Les stagiaires inscrits ne verront rien dans leur espace.
                </p>
            ) : (
                <div className="space-y-4">
                    {ressources.map((res) => {
                        const isTemp = res.id.toString().startsWith('temp-');
                        return (
                            <div
                                key={res.id}
                                /* 💡 EFFET VISUEL : Si le document vient d'être ajouté en démo, il clignote légèrement en bleu */
                                className={`flex flex-col md:flex-row gap-3 items-start md:items-end p-4 rounded-2xl border transition-all ${isTemp
                                        ? "bg-blue-100/70 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 animate-pulse"
                                        : "bg-white dark:bg-black/20 border-slate-100 dark:border-white/5 shadow-sm"
                                    }`}
                            >

                                <div className="w-full md:w-1/4 space-y-1">
                                    <Label className="text-[10px] uppercase text-slate-400 font-bold">Type</Label>
                                    <select
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#001A3D] text-sm focus:ring-2 focus:ring-blue-500"
                                        value={res.type}
                                        onChange={(e) => handleChange(res.id, 'type', e.target.value)}
                                    >
                                        <option value="PDF">Fichier PDF</option>
                                        <option value="LIEN">Lien Externe</option>
                                        <option value="VIDEO">Vidéo</option>
                                    </select>
                                </div>

                                <div className="w-full md:w-1/4 space-y-1">
                                    <Label className="text-[10px] uppercase text-slate-400 font-bold">Titre affiché</Label>
                                    <Input
                                        placeholder="Ex: Livret de révision"
                                        value={res.title}
                                        onChange={(e) => handleChange(res.id, 'title', e.target.value)}
                                        className="bg-white dark:bg-[#001A3D] focus-visible:ring-blue-500 font-medium"
                                    />
                                </div>

                                <div className="w-full md:flex-grow space-y-1">
                                    <Label className="text-[10px] uppercase text-slate-400 font-bold">Lien ou Uploader un PDF</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            placeholder="https://..."
                                            value={res.url}
                                            onChange={(e) => handleChange(res.id, 'url', e.target.value)}
                                            className="bg-white dark:bg-[#001A3D] flex-grow focus-visible:ring-blue-500"
                                        />

                                        {res.type === "PDF" && (
                                            <div className="shrink-0 bg-white dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/10 px-2 flex items-center h-10 overflow-hidden shadow-sm">
                                                <UploadButton
                                                    endpoint="pdfUploader"
                                                    onClientUploadComplete={(resData) => {
                                                        if (resData && resData[0]) {
                                                            handleChange(res.id, 'url', resData[0].url);
                                                            alert("Fichier uploadé avec succès ! N'oubliez pas de cliquer sur 'Enregistrer' en bas.");
                                                        }
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        alert(`Erreur d'upload : ${error.message}`);
                                                    }}
                                                    appearance={{
                                                        button: "bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase px-3 py-1 rounded w-auto h-auto m-0 shadow-sm",
                                                        allowedContent: "hidden"
                                                    }}
                                                    content={{ button: "Uploader" }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemove(res.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 mb-1 shrink-0"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-white/5">
                <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] shadow-md px-6 py-5">
                    {isSaving ? "Sauvegarde..." : <><Save size={14} className="mr-2" /> Enregistrer les documents</>}
                </Button>
            </div>
        </div>
    );
}