import React from 'react';
import { Clock, Users, Calendar, ArrowRight, Info, BookOpen, GraduationCap, AlertTriangle, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormationProps {
  id?: string;
  title: string;
  subtitle: string;
  duration: string;
  target: string;
  age: string;
  description: string;
  color: string;
  price?: number | null;
  descriptionDetaillee?: string;
  epreuves?: string;
  sessions?: any[];
  alerteMessage?: string | null; // 🪛 NOUVEAU : Le futur message personnalisé
}

export default function FormationCard({
  title,
  subtitle,
  duration,
  target,
  age,
  description,
  color,
  price,
  descriptionDetaillee,
  epreuves,
  sessions = [],
  alerteMessage
}: FormationProps) {

  const hasExtraInfo = descriptionDetaillee || epreuves;

  // 🪛 FINI LE TEXTE FIGÉ : On utilise le message personnalisé de la base de données
  const minInscritsMessage = alerteMessage;

  const formatSessionDate = (start: string, end: string) => {
    if (!start) return "";
    const d1 = new Date(start).toLocaleDateString('fr-FR');

    if (!end) return `Le ${d1}`;

    const d2 = new Date(end).toLocaleDateString('fr-FR');
    if (d1 === d2) return `Le ${d1}`;
    return `Du ${d1} au ${d2}`;
  };

  const upcomingSessions = (sessions || []).filter((s: any) => {
    const sessionDate = new Date(s.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate >= today;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">

      <div
        className={`h-2 w-full ${color?.startsWith('bg-') ? color : ''}`}
        style={{ backgroundColor: !color?.startsWith('bg-') ? color : undefined }}
      />

      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-[#001A3D] dark:text-white group-hover:text-primary transition-colors uppercase tracking-tighter">
            {title}
          </h3>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1 italic">
            {subtitle}
          </p>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
          {description}
        </p>

        {hasExtraInfo && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center text-[10px] font-black text-primary hover:text-blue-700 dark:hover:text-blue-300 mb-6 group/btn uppercase tracking-widest">
                <Info className="w-4 h-4 mr-1 transition-transform group-hover/btn:scale-110" />
                Détails & Épreuves
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[85vh] overflow-y-auto bg-white dark:bg-[#001A3D] border-none shadow-2xl">
              <DialogHeader className="border-b border-slate-100 dark:border-white/10 pb-6">
                <DialogTitle className="text-3xl font-black text-[#001A3D] dark:text-white uppercase tracking-tighter">
                  {title}
                </DialogTitle>
                <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mt-2 italic">// PROGRAMME COMPLET // ASSTSF //</p>
              </DialogHeader>

              <div className="py-8 space-y-10">
                {descriptionDetaillee && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <h4 className="font-black uppercase tracking-widest text-sm italic">Présentation de la formation</h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-7 border-l border-blue-600/20">
                      {descriptionDetaillee}
                    </p>
                  </div>
                )}

                {epreuves && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <GraduationCap className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-black uppercase tracking-widest text-sm italic">Épreuves & Examen</h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-7 border-l border-emerald-600/20">
                      {epreuves}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="space-y-3 pt-4 mt-auto font-medium">
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 mr-3 text-blue-600" />
            <span>Durée : <span className="text-slate-700 dark:text-slate-200">{duration}</span></span>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Users className="w-4 h-4 mr-3 text-blue-600" />
            <span>Public : {target}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4 mr-3 text-blue-600" />
            <span>Âge minimum : {age}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Tag className="w-4 h-4 mr-3 text-blue-600" />
            <span>Tarif : <span className="text-slate-700 dark:text-slate-200 font-bold">{price ? `${price} €` : "Sur devis"}</span></span>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Prochaines sessions</p>
          {upcomingSessions.length > 0 ? (
            <ul className="space-y-3">
              {upcomingSessions.slice(0, 3).map((s: any) => {
                const isExam = s.details && s.details.toUpperCase().includes("EXAM");

                return (
                  // 🪛 CORRECTION : flex-col au lieu de items-start, plus d'espace, et on enlève whitespace-nowrap
                  <li key={s.id} className="text-xs font-bold text-slate-700 dark:text-slate-300 flex flex-col gap-1.5 pb-2 border-b border-slate-100 dark:border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span className="flex-grow">{formatSessionDate(s.startDate, s.endDate)}</span>
                    </div>

                    {s.details && (
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded-md ml-3.5 leading-relaxed break-words ${isExam ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                        }`}>
                        {s.details}
                      </span>
                    )}
                  </li>
                );
              })}
              {upcomingSessions.length > 3 && (
                <li className="text-[10px] text-slate-500 italic pl-3.5">+ autres dates disponibles</li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">Aucune date programmée, sur demande.</p>
          )}
        </div>

        {minInscritsMessage && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 dark:text-amber-400 font-bold leading-tight uppercase italic">
              {minInscritsMessage}
            </p>
          </div>
        )}

      </div>

      <div className="p-6 pt-0 mt-auto">
        <Button asChild className="w-full bg-[#001A3D] hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] py-7 rounded-xl transition-all shadow-lg border border-white/5">
          <Link href={`/formations/devis?formation=${encodeURIComponent(title)}`} className="flex items-center justify-center">
            S'inscrire / Devis
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}