"use client";

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  HardHat,
  FileText,
  Clock,
  PhoneCall,
  ArrowRight,
  Activity,
  Anchor
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/SectionHeader";

const IconMap: any = {
  Users: Users,
  HardHat: HardHat,
  ShieldCheck: ShieldCheck,
  Activity: Activity,
  Anchor: Anchor,
  FileText: FileText
};

type DpsType = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  order: number;
};

export default function DPSPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dpsTypes, setDpsTypes] = useState<DpsType[]>([]);

  // 🟢 On initialise avec des textes par défaut pour éviter le vide
  const [content, setContent] = useState({
    title: "Dispositifs de Secours",
    subtitle: "Expertise & Sécurité Civile // ASSTSF",
    delais: "Prévoyez 4 à 6 semaines avant l'événement.",
    reglementation: "Accompagnement complet sur le calcul du RIS.",
    citation: "L'ASSTSF garantit le respect strict du Référentiel National de Sécurité Civile."
  });

  const [images, setImages] = useState([
    { src: "/helicoptere.jpg", label: "Équipe après intervention" },
    { src: "/concert_bandol.jpg", label: "Dispositif Concert" },
    { src: "/grandetente.jpg", label: "Poste de secours" },
    { src: "/interieur_tente.jpg", label: "Intérieur du poste de secours" },
    { src: "/rocdazur.jpg", label: "Mission Roc d'Azur" },
    { src: "/swimcup.jpg", label: "Surveillance Swim Cup" },
    { src: "/ambulances.jpg", label: "Parc Ambulances ASSTSF" },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const imgRes = await fetch('/api/site-images?category=CAROUSEL_DPS');
        const imgData = await imgRes.json();
        if (imgData && imgData.length > 0) setImages(imgData);

        const txtRes = await fetch('/api/site-content');
        const txtData = await txtRes.json();
        const findTxt = (key: string) => txtData.find((item: any) => item.key === key)?.value;

        // 🟢 Mise à jour globale des textes depuis la DB
        setContent({
          title: findTxt("dps_hero_title") || "Dispositifs de Secours",
          subtitle: findTxt("dps_hero_subtitle") || "Expertise & Sécurité Civile // ASSTSF",
          delais: findTxt("dps_saviez_vous_delais") || "Prévoyez 4 à 6 semaines avant l'événement.",
          reglementation: findTxt("dps_saviez_vous_reglementation") || "Accompagnement complet sur le calcul du RIS.",
          citation: findTxt("dps_expertise_citation") || "L'ASSTSF garantit le respect strict du Référentiel National de Sécurité Civile."
        });

        const dpsRes = await fetch('/api/dps-list');
        const dpsData = await dpsRes.json();
        const sortedDps = [...dpsData].sort((a: DpsType, b: DpsType) => (a.order || 0) - (b.order || 0));
        setDpsTypes(sortedDps);

      } catch (error) {
        console.error("Erreur lors de la synchronisation DPS:", error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#001A3D] transition-colors duration-300">

      <section className="relative py-24 px-6 overflow-hidden border-b border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-left space-y-8">
            <SectionHeader title={content.title} subtitle={content.subtitle} className="text-left" />
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-light italic">
              Organisateurs d'événements à La Seyne, Six-Fours et leurs environs :
              confiez la sécurité de votre public à des experts agréés par la <span className="text-primary font-bold">FFSS</span>.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-primary text-white font-bold uppercase tracking-widest text-[10px] px-8 py-6 shadow-lg hover:shadow-primary/20 transition-all">
                <Link href="/dps/nouvelle-demande">Demander un DPS</Link>
              </Button>
            </div>
          </div>

          <div className="relative group">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-slate-900">
              <Image key={currentSlide} src={images[currentSlide].src} alt="Illustration DPS" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-all duration-1000 animate-in fade-in zoom-in-95" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
                <p className="text-white text-[11px] uppercase tracking-[0.2em] font-black italic border-l-2 border-primary pl-4">
                  {images[currentSlide].label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <SectionHeader title="Nos Configurations" subtitle="Adaptées selon votre indice de risque (RIS)" className="mb-20" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {dpsTypes.length > 0 ? (
            dpsTypes.map((dps) => {
              const IconComponent = IconMap[dps.icon] || ShieldCheck;
              return (
                <div key={dps.id} className="group bg-slate-50 dark:bg-white/5 p-10 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all duration-500">
                  <div className="w-12 h-12 flex items-center justify-center mb-8 border-b-2 border-primary/20 group-hover:border-primary transition-colors">
                    <IconComponent className="text-primary w-6 h-6" />
                  </div>
                  <div className="space-y-1 mb-4">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{dps.shortName}</p>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{dps.name}</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                    {dps.description}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 py-20 text-center opacity-50 italic">Chargement du catalogue...</div>
          )}
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/20 border-y border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-slate-900 dark:text-white">
              Le saviez-vous <span className="text-primary font-black">?</span>
            </h2>
            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <Clock className="text-primary shrink-0 mt-1 w-5 h-5 opacity-60" />
                <p><span className="font-bold uppercase mr-2">Délais :</span> {content.delais}</p>
              </div>
              <div className="flex items-start gap-4">
                <FileText className="text-primary shrink-0 mt-1 w-5 h-5 opacity-60" />
                <p><span className="font-bold uppercase mr-2">Réglementation :</span> {content.reglementation}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-white/5 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10">
            {/* 🟢 Affichage de la citation d'expertise */}
            <p className="text-lg leading-relaxed mb-8 font-light italic text-slate-700 dark:text-slate-300">
              "{content.citation}"
            </p>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              <div className="h-[1px] w-8 bg-primary"></div> Expertise FFSS
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <SectionHeader title="Un Projet ?" subtitle="Obtenez un devis sur mesure" />
          <div className="flex flex-wrap justify-center gap-6 pt-6">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest px-12 py-8 text-[10px] shadow-2xl transition-all hover:-translate-y-1">
              <Link href="/dps/nouvelle-demande">Faire une demande de DPS</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest px-12 py-8 text-[10px] transition-all hover:-translate-y-1">
              <a href="tel:+330638161418" className="flex items-center gap-3">
                <PhoneCall size={16} /> Nous appeler
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
