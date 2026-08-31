import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldAlert, GraduationCap, Shield } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await auth();

  // 📊 Récupération dynamique des données pour les configurations DPS
  const countCatalogueDps = await prisma.catalogueDPS?.count() || 0;

  return (
    <div className="flex flex-col gap-4 pb-24 bg-background text-foreground transition-colors duration-300">

      {/* 🏛️ HERO SECTION */}
      <section className="relative pt-12 pb-12 text-center space-y-8 max-w-5xl mx-auto px-4">
        <div className="flex justify-center mb-4">
          <div className="relative w-40 h-40 transition-all duration-700 hover:scale-105 filter drop-shadow-2xl">
            <Image
              src="/log_asstsf.png"
              alt="Logo ASSTSF"
              fill
              sizes="(max-width: 768px) 130px, 130px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl md:text-5xl font-light tracking-[0.2em] text-slate-900 dark:text-white uppercase">
            Secourisme <span className="text-primary font-black">&</span> Sauvetage
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] font-medium max-w-2xl mx-auto">
            Affiliée <span className="text-primary">FFSS</span> // Agréée <span className="text-primary">Sécurité Civile</span>
          </p>
        </div>

        {/* 🟢 BOUTONS D'ACTION RAPIDE */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <Button
            asChild
            size="lg"
            className="bg-transparent dark:bg-primary border-2 border-primary text-primary dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary/90 font-bold uppercase tracking-widest px-10 py-7 text-xs shadow-sm transition-all hover:-translate-y-1 rounded-2xl"
          >
            <Link href={session ? "/dps/nouvelle-demande" : "/register"} className="flex items-center gap-2">
              <ShieldAlert size={16} />
              Demande de DPS
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="bg-transparent dark:bg-formation border-2 border-formation text-formation-foreground dark:text-formation-foreground hover:bg-formation hover:text-formation-foreground font-black uppercase tracking-widest px-10 py-7 text-xs shadow-sm transition-all hover:-translate-y-1 rounded-2xl"
          >
            <Link href={session ? "/formations/devis" : "/register"} className="flex items-center gap-2">
              <GraduationCap size={16} />
              Demande de formation
            </Link>
          </Button>
        </div>
      </section>

      {/* 🗺️ SECTIONS PUBLICS & OFFRES */}
      <section className="max-w-7xl mx-auto w-full px-6 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* 🛡️ Card Organisateur / DPS - Bordure Bleue */}
          <Link
            href="/services/dps"
            className="group relative bg-white dark:bg-slate-900/40 border-2 border-blue-500/30 dark:border-blue-500/20 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-blue-500 hover:-translate-y-2 shadow-sm shadow-black/5"
          >
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl group-hover:bg-primary group-hover:text-white text-primary transition-all duration-300">
                  <Shield size={28} />
                </div>
                <ArrowRight className="text-primary opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" size={24} />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white italic">Organisateur</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-sm">
                  Assurez la sécurité et la conformité de vos événements avec nos <strong>Dispositifs Prévisionnels de Secours (DPS)</strong> terrestres et aquatiques.
                </p>
              </div>

              {/* Badges d'information dynamiques */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl text-slate-600 dark:text-slate-300">
                  {countCatalogueDps > 0 ? `${countCatalogueDps} configurations dps` : "Sécurité Civile"}
                </span>
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl text-slate-600 dark:text-slate-300">
                  Analyse RIS
                </span>
              </div>
            </div>
          </Link>

          {/* 🎓 Card Candidat / Formations - Bordure Jaune */}
          <Link
            href="/formations"
            className="group relative bg-white dark:bg-slate-900/40 border-2 border-yellow-500/30 dark:border-yellow-500/20 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-yellow-400 hover:-translate-y-2 shadow-sm shadow-black/5"
          >
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl group-hover:bg-formation group-hover:text-formation-foreground text-amber-600 dark:text-amber-500 transition-all duration-300">
                  <GraduationCap size={28} />
                </div>
                <ArrowRight className="text-formation opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" size={24} />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white italic">Candidat</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-sm">
                  Devenez secouriste opérationnel ou sauveteur aquatique. Rejoignez nos sessions de formations initiales et continues.
                </p>
              </div>

              {/* Liste des formations clés incluant PSC et SSA */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1.5 bg-amber-500/5 dark:bg-amber-500/10 text-[9px] font-black uppercase tracking-widest rounded-xl text-amber-700 dark:text-amber-400 border border-amber-500/10">GQS</span>
                <span className="px-3 py-1.5 bg-amber-500/5 dark:bg-amber-500/10 text-[9px] font-black uppercase tracking-widest rounded-xl text-amber-700 dark:text-amber-400 border border-amber-500/10">PSC</span>
                <span className="px-3 py-1.5 bg-amber-500/5 dark:bg-amber-500/10 text-[9px] font-black uppercase tracking-widest rounded-xl text-amber-700 dark:text-amber-400 border border-amber-500/10">PSE1</span>
                <span className="px-3 py-1.5 bg-amber-500/5 dark:bg-amber-500/10 text-[9px] font-black uppercase tracking-widest rounded-xl text-amber-700 dark:text-amber-400 border border-amber-500/10">PSE2</span>
                <span className="px-3 py-1.5 bg-amber-500/5 dark:bg-amber-500/10 text-[9px] font-black uppercase tracking-widest rounded-xl text-amber-700 dark:text-amber-400 border border-amber-500/10">SSA</span>
                <span className="px-3 py-1.5 bg-amber-500/5 dark:bg-amber-500/10 text-[9px] font-black uppercase tracking-widest rounded-xl text-amber-700 dark:text-amber-400 border border-amber-500/10">SSA Littoral mention PES</span>
              </div>
            </div>
          </Link>

        </div>
      </section>
    </div>
  );
}
