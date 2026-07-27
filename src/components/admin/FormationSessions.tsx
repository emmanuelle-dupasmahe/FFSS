"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calendar, Pencil, X } from 'lucide-react';
import { toast } from "sonner";

export default function FormationSessions({ formationId }: { formationId: string }) {
    const [sessions, setSessions] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [details, setDetails] = useState("");
    const [max, setMax] = useState(12);

    // NOUVEAU : État pour savoir si on est en train de modifier une session
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSessions();
    }, [formationId]);

    const fetchSessions = async () => {
        const res = await fetch(`/api/sessions?formationId=${formationId}&t=${Date.now()}`, {
            cache: 'no-store'
        });
        const data = await res.json();
        setSessions(data);
    };

    // Fonction pour formater la date pour l'input datetime-local (gère les fuseaux horaires)
    const formatForInput = (dateString: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    // NOUVEAU : Préparer le formulaire pour la modification
    const handleEditClick = (session: any) => {
        setEditingId(session.id);
        setStartDate(formatForInput(session.startDate));
        setEndDate(formatForInput(session.endDate));
        setDetails(session.details || "");
        setMax(session.maxParticipants || 12);
    };

    // NOUVEAU : Vider le formulaire et quitter le mode édition
    const resetForm = () => {
        setEditingId(null);
        setStartDate("");
        setEndDate("");
        setDetails("");
        setMax(12);
    };

    
    // Gère l'ajout et la modification avec date de fin optionnelle
    const handleSubmit = async () => {
        // 🪛 Seule la date de début est désormais obligatoire
        if (!startDate) {
            return toast.error("Veuillez renseigner au moins la date de début.");
        }
        // 🪛 NOUVELLE SÉCURITÉ : Bloquer l'ajout d'une date passée
        const dateToCheck = new Date(startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // On compare à partir d'aujourd'hui 00h00
        
        if (dateToCheck < today) {
            return toast.error("Vous ne pouvez pas ajouter une date dans le passé !");
        }

        const payload = {
            formationId,
            startDate,
            // 🪛 Si la date de fin est vide, on lui donne automatiquement la valeur de la date de début
            endDate: endDate || startDate,
            details,
            maxParticipants: Number(max)
        };

        if (editingId) {
            // --- MODE MODIFICATION (PATCH) ---
            const res = await fetch(`/api/sessions/${editingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Session mise à jour !");
                resetForm();
                fetchSessions();
            } else {
                toast.error("Erreur lors de la modification");
            }
        } else {
            // --- MODE AJOUT (POST) ---
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Session ajoutée !");
                resetForm();
                fetchSessions();
            } else {
                toast.error("Erreur lors de l'ajout");
            }
        }
    };

    // Fonction de suppression avec sécurité sur le mode édition
    const handleDelete = async (sessionId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette date ? Les inscrits à cette date perdront leur affectation.")) return;

        try {
            const res = await fetch(`/api/sessions/${sessionId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success("Session supprimée avec succès");
                // Si on supprime la session qu'on était en train d'éditer, on vide le formulaire
                if (editingId === sessionId) resetForm();
                fetchSessions();
            } else {
                toast.error("Erreur lors de la suppression");
            }
        } catch (error) {
            toast.error("Erreur réseau");
        }
    };

    return (
        <div className="flex flex-col gap-6 pt-2 pb-8">

            {/* FORMULAIRE D'AJOUT / MODIFICATION */}
            {/* Le style change dynamiquement si on est en mode édition */}
            <div className={`p-4 rounded-xl border space-y-4 transition-colors ${editingId ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-slate-900/50 border-border'}`}>

                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        {editingId ? "Modifier la session" : "Planifier une nouvelle session"}
                    </h4>
                    {/* Bouton pour annuler la modification */}
                    {editingId && (
                        <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 text-[10px] text-slate-400 hover:text-foreground">
                            <X size={12} className="mr-1" /> Annuler
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[9px] uppercase text-slate-500 mb-1 block">Début</label>
                        <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs" />
                    </div>
                    <div>
                        <label className="text-[9px] uppercase text-slate-500 mb-1 block">Fin (optionnel)</label>
                        <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs" />
                    </div>
                </div>

                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="text-[9px] uppercase text-slate-500 mb-1 block">Précisions (ex: Examen, Sur 2 week-ends)</label>
                        <Input type="text" placeholder="Optionnel..." value={details} onChange={(e) => setDetails(e.target.value)} className="text-xs" />
                    </div>
                    <div className="w-24">
                        <label className="text-[9px] uppercase text-slate-500 mb-1 block">Places max</label>
                        <Input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="text-xs" />
                    </div>

                    {/* Le bouton s'adapte à l'état actuel */}
                    <Button onClick={handleSubmit} className={editingId ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}>
                        {editingId ? "Mettre à jour" : <><Plus size={16} className="mr-2" /> Ajouter</>}
                    </Button>
                </div>
            </div>

            {/* LISTE DES SESSIONS */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 pb-4">
                {sessions.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-4">Aucune session programmée.</p>
                )}

                {sessions.map((s: any) => (
                    <div key={s.id} className={`p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start transition-colors ${editingId === s.id ? 'bg-indigo-950/20 border-indigo-500/50' : 'bg-card border-border'}`}>

                        <div className="flex gap-3 items-start w-full min-w-0">
                            <Calendar className={`w-5 h-5 shrink-0 mt-0.5 ${editingId === s.id ? 'text-indigo-500' : 'text-emerald-500'}`} />
                            <div className="flex flex-col gap-1 w-full min-w-0">
                                <p className="text-sm font-bold text-foreground leading-snug truncate">
                                    Du {new Date(s.startDate).toLocaleDateString()} au {new Date(s.endDate).toLocaleDateString()}
                                </p>
                                {s.details && (
                                    <p className="text-xs font-medium text-amber-500 leading-normal truncate">
                                        {s.details}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                                {s._count?.inscriptions || 0} / {s.maxParticipants} inscrits
                            </span>

                            {/* BOUTON MODIFIER */}
                            <Button onClick={() => handleEditClick(s)} variant="secondary" size="icon" className="h-8 w-8 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 shrink-0">
                                <Pencil size={14} className="text-slate-600 dark:text-slate-300" />
                            </Button>

                            {/* BOUTON SUPPRIMER */}
                            <Button onClick={() => handleDelete(s.id)} variant="destructive" size="icon" className="h-8 w-8 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white shrink-0">
                                <Trash2 size={14} />
                            </Button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}