"use client";

import React, { useState } from "react";
import { Euro, CheckCircle2, History, CreditCard, Edit2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ajouterPaiement, setPrixTotal } from "@/app/actions/paiements";

export default function FinancePanel({ inscription }: { inscription: any }) {
    const prixTotal = inscription.prixTotal || 0;
    const totalPaye = inscription.paiements?.reduce((sum: number, p: any) => sum + p.montant, 0) || 0;
    const resteAPayer = prixTotal - totalPaye;
    const estSolde = resteAPayer <= 0 && prixTotal > 0;

    const [isEditingPrix, setIsEditingPrix] = useState(false);
    const [nouveauPrix, setNouveauPrix] = useState(prixTotal);
    const [montant, setMontant] = useState<number | "">("");
    const [mode, setMode] = useState<"CHEQUE" | "LIQUIDE" | "VIREMENT">("CHEQUE");
    const [nomPayeur, setNomPayeur] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdatePrix = async () => {
        setIsSubmitting(true);
        await setPrixTotal(inscription.id, Number(nouveauPrix));
        setIsEditingPrix(false);
        setIsSubmitting(false);
    };

    const handleAddPaiement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!montant || Number(montant) <= 0) return;
        setIsSubmitting(true);
        await ajouterPaiement({
            inscriptionId: inscription.id,
            montant: Number(montant),
            mode,
            nomPayeur
        });
        setMontant("");
        setNomPayeur("");
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white dark:bg-[#001A3D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Euro size={14} /> Gestion Financière
                </h4>
                {estSolde ? (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded">
                        <CheckCircle2 size={12} /> Dossier Soldé
                    </span>
                ) : (
                    <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                        Reste : {resteAPayer.toFixed(2)} €
                    </span>
                )}
            </div>

            {/* 1. Fixer le prix du forfait */}
            <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-2xl flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Forfait à payer</p>
                    {!isEditingPrix ? (
                        <p className="font-black text-lg text-foreground">{prixTotal.toFixed(2)} €</p>
                    ) : (
                        <div className="flex items-center gap-2 mt-1">
                            <Input type="number" value={nouveauPrix} onChange={(e) => setNouveauPrix(Number(e.target.value))} className="h-8 w-24 text-sm" />
                            <Button size="sm" onClick={handleUpdatePrix} disabled={isSubmitting} className="h-8 bg-emerald-600 hover:bg-emerald-700"><Save size={14} /></Button>
                        </div>
                    )}
                </div>
                {!isEditingPrix && (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingPrix(true)} className="text-slate-400 hover:text-primary">
                        <Edit2 size={14} />
                    </Button>
                )}
            </div>

            {/* 2. Saisie d'un paiement (seulement si non soldé et qu'un prix est fixé) */}
            {!estSolde && prixTotal > 0 && (
                <form onSubmit={handleAddPaiement} className="space-y-4 pt-2 border-t border-dashed border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Saisir un versement</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00" // Affiche un placeholder au lieu d'un zéro physique
                            value={montant === 0 ? "" : montant} // Si c'est 0, on affiche rien
                            onChange={(e) => setMontant(e.target.value === "" ? "" : Number(e.target.value))}
                            className="h-10"
                        />
                        <select 
    value={mode} 
    onChange={(e) => setMode(e.target.value as "CHEQUE" | "LIQUIDE" | "VIREMENT")} 
    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
>
    <option value="CHEQUE">Chèque</option>
    <option value="LIQUIDE">Espèces</option>
    <option value="VIREMENT">Virement</option>
</select>
                    </div>
                    {mode === "CHEQUE" && (
                        <Input required placeholder="Nom inscrit sur le chèque (ex: Parent)" value={nomPayeur} onChange={(e) => setNomPayeur(e.target.value)} className="h-10" />
                    )}
                    <Button type="submit" disabled={isSubmitting} className="w-full h-10 bg-blue-600 text-white font-black uppercase text-[10px] hover:bg-blue-700">
                        {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : "Enregistrer ce paiement"}
                    </Button>
                </form>
            )}

            {/* 3. Historique des versements */}
            {inscription.paiements?.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1"><History size={12} /> Historique</p>
                    {inscription.paiements.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-2.5 rounded-xl text-xs">
                            <div className="flex flex-col">
                                <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-200">
                                    <CreditCard size={12} className={p.mode === "CHEQUE" ? "text-blue-500" : "text-emerald-500"} />
                                    {p.mode === "CHEQUE" ? "Chèque" : p.mode === "VIREMENT" ? "Virement" : "Espèces"}
                                </span>
                                {p.nomPayeur && <span className="text-[9px] text-slate-400 uppercase">{p.nomPayeur}</span>}
                            </div>
                            <span className="font-black text-emerald-600">+{p.montant.toFixed(2)} €</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}