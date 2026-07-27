"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // 🆕 Ajout du Textarea
import { toast } from "sonner";
import { Save, Loader2, Settings, Menu, Shield } from "lucide-react"; // 🆕 Ajout de l'icône Shield
import { updateSiteSettings } from "@/app/actions/settings";

export default function SettingsEditor({ initialData }: { initialData: any[] }) {
    const getVal = (k: string) => initialData.find((d: any) => d.key === k)?.value || "";

    const [formData, setFormData] = useState({
        footer_title: getVal("footer_title") || "ASSTSF - Association des Secouristes de la Seyne Tamaris Six Fours",
        footer_subtitle: getVal("footer_subtitle") || "Affiliée à la FFSS // Agréée de Sécurité Civile.",
        footer_address: getVal("footer_address") || "98 Rue Fontaine, 83500 La Seyne sur Mer",
        footer_email: getVal("footer_email") || "asst.laseyne@gmail.com",
        footer_phone: getVal("footer_phone") || "",
        nav_form_1_name: getVal("nav_form_1_name") || "Secourisme (GQS, PSC, PSE1, PSE2)",
        nav_form_1_href: getVal("nav_form_1_href") || "/formations#secourisme",
        nav_form_2_name: getVal("nav_form_2_name") || "Sauvetage Aquatique (BNSSA, SSA Littoral option PES)",
        nav_form_2_href: getVal("nav_form_2_href") || "/formations#aquatique",
        nav_form_3_name: getVal("nav_form_3_name") || "Recyclages",
        nav_form_3_href: getVal("nav_form_3_href") || "/formations#recyclages",
        // 🆕 Ajout des clés pour les pages légales
        MENTIONS_LEGALES: getVal("MENTIONS_LEGALES") || "",
        CONFIDENTIALITE: getVal("CONFIDENTIALITE") || "",
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (key: string, val: string) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateSiteSettings(formData);
        if (result.success) {
            toast.success("Paramètres mis à jour !");
        } else {
            toast.error("Erreur lors de la sauvegarde");
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-8 max-w-2xl pb-12">

            {/* BLOC 1 : FOOTER */}
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
                <h2 className="text-xl font-black uppercase italic text-blue-600 flex items-center gap-2 mb-6">
                    <Settings size={20} /> Informations de contact (Footer)
                </h2>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Titre de l'association</Label>
                        <Input value={formData.footer_title} onChange={e => handleChange("footer_title", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sous-titre / Agréments</Label>
                        <Input value={formData.footer_subtitle} onChange={e => handleChange("footer_subtitle", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adresse Postale</Label>
                        <Input value={formData.footer_address} onChange={e => handleChange("footer_address", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email de contact</Label>
                        <Input value={formData.footer_email} onChange={e => handleChange("footer_email", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Téléphone (Optionnel)</Label>
                        <Input value={formData.footer_phone} onChange={e => handleChange("footer_phone", e.target.value)} placeholder="Ex: 06 12 34 56 78" className="dark:bg-[#001A3D] font-medium" />
                    </div>
                </div>
            </div>

            {/* BLOC 2 : NAVBAR */}
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
                <h2 className="text-xl font-black uppercase italic text-blue-600 flex items-center gap-2 mb-6">
                    <Menu size={20} /> Menu Déroulant (Formations) Navbar
                </h2>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lien 1 - Nom</Label>
                            <Input value={formData.nav_form_1_name} onChange={e => handleChange("nav_form_1_name", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lien 1 - URL</Label>
                            <Input value={formData.nav_form_1_href} onChange={e => handleChange("nav_form_1_href", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lien 2 - Nom</Label>
                            <Input value={formData.nav_form_2_name} onChange={e => handleChange("nav_form_2_name", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lien 2 - URL</Label>
                            <Input value={formData.nav_form_2_href} onChange={e => handleChange("nav_form_2_href", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lien 3 - Nom</Label>
                            <Input value={formData.nav_form_3_name} onChange={e => handleChange("nav_form_3_name", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lien 3 - URL</Label>
                            <Input value={formData.nav_form_3_href} onChange={e => handleChange("nav_form_3_href", e.target.value)} className="dark:bg-[#001A3D] font-medium" />
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOC 3 : PAGES LÉGALES (NOUVEAU) */}
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
                <h2 className="text-xl font-black uppercase italic text-blue-600 flex items-center gap-2 mb-6">
                    <Shield size={20} /> Pages Légales & RGPD
                </h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mentions Légales (Accepte le format HTML)</Label>
                        <Textarea
                            value={formData.MENTIONS_LEGALES}
                            onChange={e => handleChange("MENTIONS_LEGALES", e.target.value)}
                            placeholder="<h2>1. Éditeur du site</h2><p>ASSTSF...</p>"
                            className="dark:bg-[#001A3D] font-medium min-h-[200px]"
                        />
                        <p className="text-[10px] text-slate-500 italic mt-1">Laissez vide pour afficher le texte par défaut.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Politique de Confidentialité (Accepte le format HTML)</Label>
                        <Textarea
                            value={formData.CONFIDENTIALITE}
                            onChange={e => handleChange("CONFIDENTIALITE", e.target.value)}
                            placeholder="<h2>1. Collecte des données</h2><p>L'association s'engage...</p>"
                            className="dark:bg-[#001A3D] font-medium min-h-[200px]"
                        />
                        <p className="text-[10px] text-slate-500 italic mt-1">Laissez vide pour afficher le texte par défaut.</p>
                    </div>
                </div>
            </div>

            {/* BOUTON DE SAUVEGARDE GLOBAL */}
            <Button onClick={handleSave} disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl uppercase font-black text-[10px] flex gap-2 h-14 mt-8 shadow-lg transition-transform active:scale-95">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Enregistrer tous les paramètres
            </Button>
        </div>
    );
}