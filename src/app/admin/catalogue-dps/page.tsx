"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Save, LayoutGrid, Edit2, X, Users, HardHat, Activity, Anchor } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import SectionHeader from "@/components/SectionHeader";

const IconComponent = ({ name, size = 20 }: { name: string, size?: number }) => {
    const icons: any = { ShieldCheck, Users, HardHat, Activity, Anchor };
    const Icon = icons[name] || ShieldCheck;
    return <Icon size={size} />;
};

export default function AdminCatalogueDPS() {
    const [dpsList, setDpsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    // 🟢 État pour les textes de la section "Saviez-vous ?"
    const [siteContent, setSiteContent] = useState({
        dps_saviez_vous_delais: "",
        dps_saviez_vous_reglementation: "",
        dps_expertise_citation: ""
    });

    const [newItem, setNewItem] = useState({
        name: '',
        shortName: '',
        description: '',
        icon: 'ShieldCheck',
        color: 'blue',
        order: 0
    });

    // 🟢 Chargement initial (Catalogue + Textes)
    const fetchData = async () => {
        try {
            // A. Charger les DPS
            const res = await fetch('/api/dps-list');
            const data = await res.json();
            setDpsList(data);

            // B. Charger les textes de la page
            const txtRes = await fetch('/api/site-content');
            const txtData = await txtRes.json();
            const getContent = (key: string) => txtData.find((i: any) => i.key === key)?.value || "";

            setSiteContent({
                dps_saviez_vous_delais: getContent("dps_saviez_vous_delais"),
                dps_saviez_vous_reglementation: getContent("dps_saviez_vous_reglementation"),
                dps_expertise_citation: getContent("dps_expertise_citation"),
            });
        } catch (err) {
            toast.error("Erreur de chargement des données");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 🟢 Sauvegarde des textes (Clé/Valeur)
    const handleSaveContent = async (key: string, value: string) => {
        try {
            const res = await fetch('/api/site-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            });
            if (res.ok) toast.success("Texte mis à jour !");
        } catch (err) {
            toast.error("Erreur de sauvegarde du texte");
        }
    };

    const handleAdd = async () => {
        if (!newItem.name || !newItem.shortName) {
            toast.error("Nom et Code obligatoires");
            return;
        }
        try {
            const res = await fetch('/api/dps-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });
            if (res.ok) {
                toast.success("Dispositif ajouté !");
                setNewItem({ name: '', shortName: '', description: '', icon: 'ShieldCheck', color: 'blue', order: 0 });
                fetchData();
            }
        } catch (err) {
            toast.error("Erreur lors de l'ajout");
        }
    };

    const handleUpdate = async (dps: any) => {
        try {
            const res = await fetch(`/api/dps-list/${dps.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dps),
            });
            if (res.ok) {
                toast.success("Mise à jour réussie !");
                setEditingId(null);
                fetchData();
            }
        } catch (err) {
            toast.error("Erreur de sauvegarde");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce dispositif ?")) return;
        try {
            const res = await fetch(`/api/dps-list/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Supprimé");
                fetchData();
            }
        } catch (err) {
            toast.error("Erreur");
        }
    };

    if (loading) return <div className="p-10 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Chargement...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-12">
            <SectionHeader title="Catalogue DPS" subtitle="Gestion des configurations de secours" />

            {/* 🟢 BLOC : ÉDITION DES TEXTES DE LA PAGE */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">// SECTION "LE SAVIEZ-VOUS ?"</h3>
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400">Délais d'intervention</label>
                        <div className="flex gap-2">
                            <Input
                                value={siteContent.dps_saviez_vous_delais}
                                onChange={(e) => setSiteContent({ ...siteContent, dps_saviez_vous_delais: e.target.value })}
                                placeholder="ex: Prévoyez 4 à 6 semaines..."
                            />
                            <Button onClick={() => handleSaveContent("dps_saviez_vous_delais", siteContent.dps_saviez_vous_delais)} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-4">Ok</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400">Texte Réglementation</label>
                        <div className="flex gap-2">
                            <Input
                                value={siteContent.dps_saviez_vous_reglementation}
                                onChange={(e) => setSiteContent({ ...siteContent, dps_saviez_vous_reglementation: e.target.value })}
                                placeholder="ex: Accompagnement complet sur le calcul..."
                            />
                            <Button onClick={() => handleSaveContent("dps_saviez_vous_reglementation", siteContent.dps_saviez_vous_reglementation)} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-4">Ok</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400">Citation Expertise (bloc de droite)</label>
                        <div className="flex gap-2 items-start">
                            <Textarea
                                value={siteContent.dps_expertise_citation}
                                onChange={(e) => setSiteContent({ ...siteContent, dps_expertise_citation: e.target.value })}
                                placeholder="Citation FFSS..."
                                className="h-20"
                            />
                            <Button onClick={() => handleSaveContent("dps_expertise_citation", siteContent.dps_expertise_citation)} className="bg-emerald-600 hover:bg-emerald-700 px-4">Ok</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ➕ FORMULAIRE D'AJOUT */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500">// NOUVELLE CONFIGURATION</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Nom (ex: Petite Envergure)" />
                    <Input value={newItem.shortName} onChange={(e) => setNewItem({ ...newItem, shortName: e.target.value })} placeholder="Code (ex: DPS-PE)" />

                    <select
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-xl text-sm h-12"
                        value={newItem.icon}
                        onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                    >
                        <option value="ShieldCheck">🛡️ Bouclier (Standard)</option>
                        <option value="Users">👥 Groupe (PAPS)</option>
                        <option value="HardHat">⛑️ Casque (Logistique)</option>
                        <option value="Activity">⚡ Pouls (Urgence)</option>
                        <option value="Anchor">⚓ Ancre (Nautique)</option>
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                        <Input value={newItem.color} onChange={(e) => setNewItem({ ...newItem, color: e.target.value })} placeholder="Couleur (blue)" />
                        <Input
                            type="number"
                            value={newItem.order}
                            onChange={(e) => setNewItem({ ...newItem, order: parseInt(e.target.value) })}
                            placeholder="Ordre"
                        />
                    </div>

                    <Textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Description..." className="md:col-span-2 h-24" />

                    <Button onClick={handleAdd} className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] py-6 shadow-lg shadow-blue-500/20">
                        <Plus size={16} className="mr-2" /> Enregistrer au catalogue
                    </Button>
                </div>
            </div>

            {/* 📋 LISTE DES DISPOSITIFS */}
            <div className="grid grid-cols-1 gap-4">
                {dpsList.map((dps: any) => (
                    <div key={dps.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm transition-all">

                        {editingId === dps.id ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input defaultValue={dps.name} onChange={(e) => dps.name = e.target.value} />
                                    <Input defaultValue={dps.shortName} onChange={(e) => dps.shortName = e.target.value} />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <select
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 rounded-md text-sm h-10"
                                        defaultValue={dps.icon}
                                        onChange={(e) => dps.icon = e.target.value}
                                    >
                                        <option value="ShieldCheck">🛡️ Bouclier</option>
                                        <option value="Users">👥 Groupe</option>
                                        <option value="HardHat">⛑️ Casque</option>
                                        <option value="Activity">⚡ Pouls</option>
                                        <option value="Anchor">⚓ Ancre</option>
                                    </select>
                                    <Input defaultValue={dps.color} onChange={(e) => dps.color = e.target.value} placeholder="Couleur" />
                                    <Input
                                        type="number"
                                        defaultValue={dps.order}
                                        onChange={(e) => dps.order = parseInt(e.target.value)}
                                        placeholder="Ordre"
                                    />
                                </div>
                                <Textarea defaultValue={dps.description} onChange={(e) => dps.description = e.target.value} className="h-24" />
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}><X size={14} className="mr-2" /> Annuler</Button>
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={() => handleUpdate(dps)}><Save size={14} className="mr-2" /> Sauvegarder</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6 cursor-pointer" onClick={() => setEditingId(dps.id)}>
                                    <div className="p-4 bg-blue-500/10 rounded-xl text-blue-500">
                                        <IconComponent name={dps.icon} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white uppercase italic">{dps.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-[10px] font-black text-blue-500 tracking-widest uppercase">{dps.shortName}</p>
                                            <span className="text-[9px] text-slate-400 font-mono">Pos: {dps.order}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(dps.id)} className="text-slate-400 hover:text-blue-500"><Edit2 size={16} /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dps.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}