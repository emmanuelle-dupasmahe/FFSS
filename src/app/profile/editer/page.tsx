"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Building, Save, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EditerProfilPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // États locaux pour le formulaire (pré-remplis pour faire réaliste lors de la démo)
    const [formData, setFormData] = useState({
        name: "Essai Signature",
        email: "test.asstsf@gmail.com",
        phone: "06 12 34 56 78",
        structure: "Mairie de la Seyne",
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // 🪄 Simulation parfaite d'un appel serveur pour la démonstration
        setTimeout(() => {
            toast.success("Vos informations ont été mises à jour avec succès !", {
                icon: <ShieldCheck className="text-emerald-500" />
            });
            setIsSaving(false);

            // Retour automatique vers le tableau de bord après 1 seconde
            setTimeout(() => {
                router.back();
            }, 1000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#001A3D] p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* En-tête avec bouton retour */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} /> Retour au tableau de bord
                    </Button>
                </div>

                {/* Titre de la page */}
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                        Éditer mon <span className="text-blue-600">Profil</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Mettez à jour vos coordonnées organisateur
                    </p>
                </div>

                {/* Carte du Formulaire */}
                <form onSubmit={handleSave} className="bg-white dark:bg-white/5 rounded-[2rem] p-8 shadow-xl border border-slate-200 dark:border-white/10 space-y-6 relative overflow-hidden">

                    {/* Décoration d'arrière-plan */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">

                        {/* Champ Nom */}
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <User size={14} className="text-blue-600" /> Nom complet ou Contact
                            </Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 bg-slate-50 dark:bg-[#001A3D] border-slate-200 dark:border-white/10 font-bold dark:text-white rounded-xl"
                                required
                            />
                        </div>

                        {/* Champ Email */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <Mail size={14} className="text-blue-600" /> Adresse Email
                            </Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-12 bg-slate-50 dark:bg-[#001A3D] border-slate-200 dark:border-white/10 font-bold dark:text-white rounded-xl"
                                required
                            />
                        </div>

                        {/* Champ Téléphone */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <Phone size={14} className="text-blue-600" /> Téléphone
                            </Label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-12 bg-slate-50 dark:bg-[#001A3D] border-slate-200 dark:border-white/10 font-bold dark:text-white rounded-xl"
                            />
                        </div>

                        {/* Champ Structure */}
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <Building size={14} className="text-blue-600" /> Nom de la structure (Mairie, Association...)
                            </Label>
                            <Input
                                value={formData.structure}
                                onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                                className="h-12 bg-slate-50 dark:bg-[#001A3D] border-slate-200 dark:border-white/10 font-bold dark:text-white rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Zone d'action */}
                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/10 flex justify-end relative z-10">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin" size={18} /> Sauvegarde...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2" size={18} /> Enregistrer les modifications
                                </>
                            )}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    );
}