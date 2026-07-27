"use client";

import React from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import FormationCard from "./FormationCard"; // 🟢 On importe ton composant de carte standard

interface RecyclageProps {
  formations: any[];
}

export default function RecyclageBlock({ formations }: RecyclageProps) {
  // 🟢 On filtre les recyclages
  const recyclagesDynamiques = formations.filter(f =>
    f.title.toLowerCase().includes("recyclage") ||
    f.title.toLowerCase().includes("mac") ||
    f.title.toLowerCase().includes("maintien")
  );

  if (recyclagesDynamiques.length === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-white/5 rounded-[2.5rem] p-8 md:p-12 border-2 border-dashed border-blue-200 dark:border-white/10">
      
      {/* HEADER DU BLOC */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-lg">
          <RefreshCw className="w-10 h-10 text-red-600 animate-spin-slow" />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black text-[#001A3D] dark:text-white uppercase tracking-tight">Formation Continue</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Maintenez la validité de vos diplômes avec l'ASSTSF</p>
        </div>
      </div>

      {/* 🟢 GRILLE  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recyclagesDynamiques.map((item) => (
          <FormationCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            description={item.description}
            duration={item.duration}
            color={item.color || "bg-slate-900"} // Couleur plus sombre pour le recyclage
            // On passe les autres props si ton FormationCard les attend (ex: age, target)
            age={`${item.ageMin} ans`}
            target={item.details?.target || "Titulaires du diplôme"}
          />
        ))}
      </div>

      {/* FOOTER DU BLOC */}
      <div className="mt-12 flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/20 w-fit mx-auto px-6 py-2 rounded-full border border-white/10">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span>Toutes nos sessions sont validées par la FFSS 83.</span>
      </div>
    </div>
  );
}
