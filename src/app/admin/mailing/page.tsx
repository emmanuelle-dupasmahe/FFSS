"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { envoyerMailCible } from "@/app/actions/mailing";

export default function MailingAdminPage() {
    const [formations, setFormations] = useState<any[]>([]);
    const [selectedFormationId, setSelectedFormationId] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [loadingFormations, setLoadingFormations] = useState(true);

    // Charger la liste des formations pour le menu déroulant
    useEffect(() => {
        const fetchFormations = async () => {
            try {
                const res = await fetch('/api/formations-list');
                if (res.ok) {
                    const data = await res.json();
                    setFormations(data);
                }
            } catch (error) {
                toast.error("Erreur lors du chargement des formations.");
            } finally {
                setLoadingFormations(false);
            }
        };
        fetchFormations();
    }, []);

    const handleSend = async () => {
        if (!selectedFormationId) return toast.error("Veuillez sélectionner une formation cible.");
        if (!subject.trim()) return toast.error("Veuillez renseigner un objet pour l'e-mail.");
        if (!body.trim()) return toast.error("Veuillez rédiger le contenu du message.");

        const formationCible = formations.find(f => f.id === selectedFormationId)?.title;
        if (!confirm(`Confirmez-vous l'envoi de cet e-mail à TOUS les stagiaires validés de la formation : ${formationCible} ?`)) return;

        setIsSending(true);
        toast.loading("Envoi des e-mails en cours...", { id: "mailing-progress" });

        // On convertit les sauts de ligne du Textarea en balises <br> pour le HTML de l'e-mail
        const htmlBody = body.replace(/\n/g, "<br />");

        const result = await envoyerMailCible(selectedFormationId, subject, htmlBody);

        if (result.success) {
            toast.success(result.message, { id: "mailing-progress" });
            // On vide le formulaire après un envoi réussi
            setSubject("");
            setBody("");
        } else {
            toast.error(result.message, { id: "mailing-progress" });
        }
        
        setIsSending(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
            {/* EN-TÊTE */}
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-black uppercase italic text-foreground tracking-tight">Mailing Ciblé</h1>
                    <p className="text-sm text-slate-500">Envoyez un e-mail groupé aux stagiaires d'une formation spécifique.</p>
                </div>
            </div>

            {/* FORMULAIRE */}
            <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-8">
                
                {/* Choix de la cible */}
                <div className="space-y-3 border-b border-border pb-6">
                    <Label className="text-xs font-black uppercase tracking-widest text-blue-600">1. Sélectionnez la cible</Label>
                    {loadingFormations ? (
                        <div className="text-sm text-slate-500 italic">Chargement des formations...</div>
                    ) : (
                        <select 
                            value={selectedFormationId} 
                            onChange={(e) => setSelectedFormationId(e.target.value)}
                            className="w-full p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Choisissez une formation --</option>
                            {formations.map(f => (
                                <option key={f.id} value={f.id}>{f.title}</option>
                            ))}
                        </select>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1 italic">
                        L'e-mail sera envoyé uniquement aux inscrits dont le dossier administratif est "VALIDÉ".
                    </p>
                </div>

                {/* Rédaction du message */}
                <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-blue-600">2. Rédigez le message</Label>
                    
                    <div>
                        <Label className="text-[10px] uppercase text-slate-500 mb-1 block">Objet de l'e-mail</Label>
                        <Input 
                            placeholder="Ex: Informations importantes pour votre stage..." 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)}
                            className="font-bold text-base"
                        />
                    </div>

                    <div>
                        <Label className="text-[10px] uppercase text-slate-500 mb-1 block">Contenu de l'e-mail</Label>
                        <Textarea 
                            placeholder="Bonjour,&#10;&#10;Nous vous informons que..." 
                            value={body} 
                            onChange={(e) => setBody(e.target.value)}
                            className="min-h-[250px] resize-y text-base p-4"
                        />
                    </div>
                </div>

                {/* Bouton d'envoi */}
                <div className="pt-4 flex justify-end">
                    <Button 
                        onClick={handleSend} 
                        disabled={isSending || loadingFormations}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest px-8 py-6 rounded-xl flex gap-3 text-xs w-full sm:w-auto"
                    >
                        {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        {isSending ? "Envoi en cours..." : "Lancer l'envoi massif"}
                    </Button>
                </div>
            </div>
        </div>
    );
}