"use client";

import React, { useState } from 'react';
import { Users, Mail, Phone, Building, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FormationInscrits({ inscriptions = [] }: { inscriptions?: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    // On compte le nombre réel de participants attendus (utile pour les groupes)
    const totalParticipants = inscriptions.reduce((total, ins) => total + (ins.expectedParticipants || 1), 0);

    return (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 transition-all">
            {/* EN-TÊTE CLIQUABLE */}
            <div
                className="flex justify-between items-center cursor-pointer select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="font-black uppercase text-slate-800 dark:text-white text-sm md:text-base">
                            Stagiaires Inscrits
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            {inscriptions.length} Dossier(s) • {totalParticipants} Personne(s)
                        </p>
                    </div>
                </div>

                <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </Button>
            </div>

            {/* LISTE DÉROULANTE */}
            {isOpen && (
                <div className="pt-6 mt-4 border-t border-indigo-100/50 dark:border-indigo-900/30 animate-in slide-in-from-top-2 duration-200">
                    {inscriptions.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4 bg-white/50 dark:bg-black/10 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/50">
                            Aucune inscription pour cette formation pour le moment.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {inscriptions.map((ins) => (
                                <div key={ins.id} className="bg-white dark:bg-[#001A3D]/60 p-4 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">

                                    {/* Infos Principales */}
                                    <div className="flex items-start gap-3">
                                        {ins.typeDemande === "STRUCTURE" ? (
                                            <Building className="text-amber-500 mt-1 shrink-0" size={18} />
                                        ) : (
                                            <User className="text-emerald-500 mt-1 shrink-0" size={18} />
                                        )}
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                                                {ins.typeDemande === "STRUCTURE" ? ins.structureName : ins.user?.name || "Nom inconnu"}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Statut : <span className="text-indigo-600 font-bold">{ins.status}</span>
                                                {ins.typeDemande === "STRUCTURE" && ` • ${ins.expectedParticipants} participants`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Contacts */}
                                    <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            <span>{ins.user?.email || "Pas d'email"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-slate-400" />
                                            <span>{ins.user?.phone || "Pas de téléphone"}</span>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}