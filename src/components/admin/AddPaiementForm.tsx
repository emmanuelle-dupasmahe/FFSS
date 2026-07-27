"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ajouterPaiement } from "@/app/actions/paiements";
import { Euro, CheckCircle2, Loader2 } from "lucide-react";

export default function AddPaiementForm({ inscriptionId, resteAPayer }: { inscriptionId: string, resteAPayer: number }) {
    const [montant, setMontant] = useState<number | "">(resteAPayer > 0 ? resteAPayer : "");
    const [mode, setMode] = useState<"CHEQUE" | "LIQUIDE">("CHEQUE");
    const [nomPayeur, setNomPayeur] = useState("");
    const [numCheque, setNumCheque] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!montant || Number(montant) <= 0) return;

        setIsSubmitting(true);
        const res = await ajouterPaiement({
            inscriptionId,
            montant: Number(montant),
            mode,
            nomPayeur,
            numCheque
        });
        setIsSubmitting(false);

        if (res.success) {
            setSuccess(true);
            setMontant("");
            setNomPayeur("");
            setNumCheque("");
            setTimeout(() => setSuccess(false), 3000); // Masque le message après 3s
        } else {
            alert(res.error);
        }
    };

    if (resteAPayer <= 0 && !success) {
        return (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                <CheckCircle2 size={18} /> Dossier Soldé
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-sm">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <Euro size={14} /> Saisir un versement
            </h4>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Montant (€)</Label>
                    <Input type="number" step="0.01" required value={montant} onChange={(e) => setMontant(e.target.value ? Number(e.target.value) : "")} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Mode</Label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value as "CHEQUE" | "LIQUIDE")}
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="CHEQUE">Chèque</option>
                        <option value="LIQUIDE">Espèces</option>
                    </select>
                </div>
            </div>

            {mode === "CHEQUE" && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Nom sur le chèque</Label>
                        <Input placeholder="Ex: M. Martin" value={nomPayeur} onChange={(e) => setNomPayeur(e.target.value)} className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">N° Chèque (Optionnel)</Label>
                        <Input placeholder="Ex: 1234567" value={numCheque} onChange={(e) => setNumCheque(e.target.value)} className="h-10 rounded-xl" />
                    </div>
                </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-xl text-[10px] uppercase font-black bg-blue-600 hover:bg-blue-700 text-white mt-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : "Enregistrer le versement"}
            </Button>

            {success && <p className="text-[10px] text-emerald-600 font-bold uppercase text-center mt-2">Paiement enregistré avec succès !</p>}
        </form>
    );
}