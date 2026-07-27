"use client";

import React, { useState, useEffect } from 'react';
import FormationCard from "@/components/FormationCard";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PhoneCall } from "lucide-react";

export default function FormationsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formations, setFormations] = useState([]);
  const [content, setContent] = useState({
    title: "Nos Formations",
    subtitle: "De l'initiation au diplôme professionnel // ASSTSF"
  });

  const [images, setImages] = useState([
    { src: "/formation_pse1.jpg", label: "Formation PSE1 : RCP" },
    { src: "/formation_pse2.jpg", label: "Formation PSE2 : plan dur" },
    { src: "/ssa.jpg", label: "SSA (Surveillant Sauveteur Aquatique)" },
    { src: "/bnssa.jpg", label: "BNSSA : Entrainement piscine" },
  ]);

  const sortFormations = (list: any[]) => {
    return [...list].sort((a, b) => {
      const getIndex = (title: string) => {
        const t = title.toUpperCase();
        if (t.includes("GQS") || t.includes("GESTES QUI SAUVENT")) return 0;
        if (t.includes("PSC")) return 1;
        if (t.includes("PSE 1") || t.includes("PSE1")) return 2;
        if (t.includes("PSE 2") || t.includes("PSE2")) return 3;
        if (t.includes("BNSSA")) return 1;
        if ((t.includes("SSA") && !t.includes("BNSSA")) || t.includes("SURVEILLANT SAUVETEUR AQUATIQUE")) return 2;
        return 99;
      };
      return getIndex(a.title) - getIndex(b.title);
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const imgRes = await fetch('/api/site-images?category=CAROUSEL_FORMATIONS');
        const imgData = await imgRes.json();
        if (imgData && imgData.length > 0) setImages(imgData);

        const txtRes = await fetch('/api/site-content');
        const txtData = await txtRes.json();
        const dbTitle = txtData.find((item: any) => item.key === "formations_hero_title")?.value;
        const dbSubtitle = txtData.find((item: any) => item.key === "formations_hero_subtitle")?.value;

        if (dbTitle || dbSubtitle) {
          setContent({
            title: dbTitle || "Nos Formations",
            subtitle: dbSubtitle || "De l'initiation au diplôme professionnel // ASSTSF"
          });
        }

        const resForm = await fetch('/api/formations-list');
        const dataForm = await resForm.json();
        setFormations(dataForm);
      } catch (error) {
        console.error("Erreur de synchronisation:", error);
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
    <div className="min-h-screen bg-white dark:bg-[#001A3D] transition-colors duration-300 font-sans">

      {/* HERO SECTION */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-left space-y-8">
            <SectionHeader
              title={content.title}
              subtitle={content.subtitle}
              className="text-left"
            />
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-light italic">
              Découvrez nos cursus d'excellence pour devenir un acteur majeur du secours et du sauvetage.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="formation" size="lg" className="font-bold uppercase tracking-widest text-[10px] px-8 py-6 shadow-lg transition-all hover:-translate-y-0.5">
                <Link href="/formations/devis">Demander un devis</Link>
              </Button>
            </div>
          </div>
          <div className="relative group">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-slate-900">
              <Image key={currentSlide} src={images[currentSlide].src} alt="Illustration Formation" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority className="object-cover transition-all duration-1000 animate-in fade-in zoom-in-95" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
                <p className="text-white text-[11px] uppercase tracking-[0.2em] font-black italic border-l-2 border-primary pl-4">
                  {images[currentSlide].label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* 🟢 SECOURISME : PSC > PSE 1 > PSE 2 */}
        <section id="secourisme" className="mb-32 scroll-mt-32">
          <SectionHeader title="Secourisme" subtitle="Sauver des vies sur terre" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortFormations(
              formations.filter((f: any) => {
                const title = f.title.toUpperCase();
                return (title.includes("GQS") || title.includes("GESTES QUI SAUVENT") || title.includes("PSC") || title.includes("PSE")) &&
                  !title.includes("RECYCLAGE") && !title.includes("MAC") && !title.includes("MAINTIEN");
              })
            ).map((f: any) => (
              <FormationCard
                key={f.id}
                {...f}
                target={f.details?.target || "Tout public"} // 🪛 AJOUT ICI
                sessions={f.sessions} // 🪛 AJOUT ICI (pour afficher les dates)
                descriptionDetaillee={f.descriptionDetaillee}
                epreuves={f.epreuves}
                color={f.color || "bg-blue-600"}
                age={`${f.ageMin} ans`}
              />
            ))}
          </div>
        </section>

        {/* 🟢 AQUATIQUE : BSB > BNSSA > SSA */}
        <section id="aquatique" className="mb-32 scroll-mt-32">
          <SectionHeader title="Aquatique" subtitle="L'excellence du sauvetage // BNSSA & SSA" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortFormations(
              formations.filter((f: any) => {
                const title = f.title.toUpperCase();
                return (title.includes("BNSSA") || title.includes("SSA") || title.includes("SURVEILLANT SAUVETEUR AQUATIQUE")) &&
                  !title.includes("RECYCLAGE") && !title.includes("MAC") && !title.includes("MAINTIEN");
              })
            ).map((f: any) => {
              return (
                <FormationCard
                  key={f.id}
                  {...f}
                  title={f.title}
                  target={f.details?.target || "Tout public"} // 🪛 AJOUT ICI
                  sessions={f.sessions} // 🪛 AJOUT ICI
                  descriptionDetaillee={f.descriptionDetaillee}
                  epreuves={f.epreuves}
                  color={f.color || "bg-red-600"}
                  age={`${f.ageMin} ans`}
                />
              );
            })}
          </div>
        </section>

        {/* 🟢 RECYCLAGES */}
        <section id="recyclages" className="mb-32 scroll-mt-32">
          <SectionHeader title="Recyclages" subtitle="Maintenir vos compétences à jour" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formations
              .filter((f: any) => {
                const title = f.title.toUpperCase();
                return title.includes("RECYCLAGE") || title.includes("MAC") || title.includes("MAINTIEN");
              })
              .map((f: any) => (
                <FormationCard
                  key={f.id}
                  {...f}
                  target={f.details?.target || "Tout public"}
                  sessions={f.sessions}
                  descriptionDetaillee={undefined}
                  epreuves={undefined}
                  color={f.color || "bg-emerald-600"}
                  age={`${f.ageMin} ans`}
                />
              ))}
          </div>
        </section>

        {/* 🟢 AUTRES FORMATIONS */}
        {formations.filter((f: any) => {
          const title = f.title.toUpperCase();
          const isSecourisme = (title.includes("GQS") || title.includes("GESTES QUI SAUVENT") || title.includes("PSC") || title.includes("PSE"));
          const isAquatique = (title.includes("BNSSA") || title.includes("SSA") || title.includes("SURVEILLANT SAUVETEUR AQUATIQUE"));
          const isRecyclage = (title.includes("RECYCLAGE") || title.includes("MAC") || title.includes("MAINTIEN"));

          return !isSecourisme && !isAquatique && !isRecyclage;
        }).length > 0 && (
            <section id="autres" className="mb-32 scroll-mt-32">
              <SectionHeader title="Autres Formations" subtitle="Découvrez nos autres cursus et spécialités" className="mb-12" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {formations
                  .filter((f: any) => {
                    const title = f.title.toUpperCase();
                    const isSecourisme = (title.includes("GQS") || title.includes("GESTES QUI SAUVENT") || title.includes("PSC") || title.includes("PSE"));
                    const isAquatique = (title.includes("BNSSA") || title.includes("SSA") || title.includes("SURVEILLANT SAUVETEUR AQUATIQUE"));
                    const isRecyclage = (title.includes("RECYCLAGE") || title.includes("MAC") || title.includes("MAINTIEN"));

                    return !isSecourisme && !isAquatique && !isRecyclage;
                  })
                  .map((f: any) => (
                    <FormationCard
                      key={f.id}
                      {...f}
                      target={f.details?.target || "Tout public"} 
                      sessions={f.sessions} 
                      descriptionDetaillee={f.descriptionDetaillee}
                      epreuves={f.epreuves}
                      color={f.color || "bg-slate-700"}
                      age={f.ageMin ? `${f.ageMin} ans` : undefined}
                    />
                  ))}
              </div>
            </section>
          )}

      </div>

      {/* CTA FINAL IDENTIQUE À DPS */}
      <section className="py-32 px-6 text-center border-t border-slate-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto space-y-10">
          <SectionHeader title="Un Projet ?" subtitle="Besoin d'une formation sur mesure" />
          <div className="flex flex-wrap justify-center gap-6 pt-6">
            <Button asChild variant="formation" size="lg" className="font-bold uppercase tracking-widest px-12 py-8 text-[10px] shadow-2xl transition-all hover:-translate-y-1">
              <Link href="/formations/devis">Demander un devis formation</Link>
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