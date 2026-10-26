"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changeInscriptionFormation } from "@/app/actions/formations";
import { toast } from "sonner";

type FormationOption = {
    id: string;
    title: string;
    isActive: boolean;
    sessions: { id: string; startDate: Date | null; endDate: Date | null }[];
};

export default function ChangeFormationPanel({
    inscription,
    formations
}: {
    inscription: { id: string; formationId: string; sessionId: string | null; devisUrl: string | null; isDevisSigned: boolean };
    formations: FormationOption[];
}) {
    const [formationId, setFormationId] = useState(inscription.formationId);
    const [sessionId, setSessionId] = useState(inscription.sessionId || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sessions = formations.find(f => f.id === formationId)?.sessions || [];
    const hasChanged = formationId !== inscription.formationId || sessionId !== (inscription.sessionId || "");
    const hasDevis = !!inscription.devisUrl || inscription.isDevisSigned;

    const formatSession = (s: FormationOption["sessions"][number]) => {
        if (!s.startDate) return "Date à définir";
        const debut = new Date(s.startDate).toLocaleDateString("fr-FR");
        const fin = s.endDate ? new Date(s.endDate).toLocaleDateString("fr-FR") : null;
        return fin && fin !== debut ? `Du ${debut} au ${fin}` : `Le ${debut}`;
    };

    const handleFormationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormationId(e.target.value);
        // Les dates dépendent de la formation : on réinitialise le choix
        setSessionId("");
    };

    const handleSubmit = async () => {
        const avertissement = hasDevis
            ? "\n\n⚠️ Le devis déjà envoyé (et sa signature) sera annulé : il faudra générer un nouveau devis et vérifier le prix dans la gestion financière."
            : "";
        if (!confirm(`Confirmer le changement de formation pour ce dossier ?${avertissement}`)) return;

        setIsSubmitting(true);
        const loadingToast = toast.loading("Changement de formation...");

        try {
            const result = await changeInscriptionFormation(inscription.id, formationId, sessionId || null);

            if (result?.error) {
                toast.error(result.error, { id: loadingToast });
            } else {
                toast.success(
                    result.devisAnnule ? "Formation modifiée. Pensez à générer un nouveau devis." : "Formation modifiée avec succès !",
                    { id: loadingToast }
                );
            }
        } catch (error) {
            toast.error("Une erreur technique est survenue.", { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectClass = "w-full h-10 rounded-xl px-3 text-sm bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-foreground outline-none focus:border-blue-500";

    return (
        <div className="bg-white dark:bg-[#001A3D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
                <ArrowRightLeft size={14} /> Changer de formation
            </h4>

            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Formation</label>
                <select value={formationId} onChange={handleFormationChange} disabled={isSubmitting} className={selectClass}>
                    {formations.map(f => (
                        <option key={f.id} value={f.id}>
                            {f.title}{!f.isActive ? " (désactivée)" : ""}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Date de session</label>
                <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} disabled={isSubmitting} className={selectClass}>
                    <option value="">Sans date précise</option>
                    {sessions.map(s => (
                        <option key={s.id} value={s.id}>{formatSession(s)}</option>
                    ))}
                </select>
            </div>

            {hasChanged && hasDevis && (
                <p className="text-[11px] text-amber-600 bg-amber-500/10 rounded-xl p-3">
                    Un devis a déjà été envoyé pour ce dossier : il sera annulé et il faudra en générer un nouveau.
                </p>
            )}

            <Button
                onClick={handleSubmit}
                disabled={!hasChanged || isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl"
            >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Enregistrer le changement"}
            </Button>
        </div>
    );
}
