"use client";

import { useState } from "react";
import {
  ClipboardList,
  Calendar,
  MapPin,
  Clock,
  Send,
  AlertCircle,
  Activity, // Icône pour P2
  Scaling,  // Icône pour E1
  Stethoscope, // Icône pour E2
  CalendarDays, // Nouvelle icône pour les champs date
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createDevisDPS } from "@/app/actions/dps";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";

export default function NouvelleDemandeDPS() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Gestion des Select existants
  const [eventType, setEventType] = useState("");
  const [configLocation, setConfigLocation] = useState("");

  // NOUVEAU : Gestion des Select pour l'évaluation des risques
  const [ambiance, setAmbiance] = useState("");
  const [accessibilite, setAccessibilite] = useState("");
  const [delaiSecours, setDelaiSecours] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    // On ajoute manuellement les valeurs des Select au FormData
    formData.append("type", eventType);
    formData.append("config", configLocation);

    // NOUVEAU : Ajout des infos de risque
    formData.append("ambiance", ambiance);
    formData.append("accessibilite", accessibilite);
    formData.append("delaiSecours", delaiSecours);

    try {
      const result = await createDevisDPS(formData);

      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success && result?.id) {
        toast.success("Demande envoyée avec succès !");
        router.push(`/admin/devis-dps/${result.id}`);
      }
    } catch (error) {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  const selectContentStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-xl";

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-10">

      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
          <ClipboardList size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Demande de Dispositif</span>
        </div>
        <h1 className="text-4xl font-light uppercase tracking-tighter">
          Nouvelle Demande de <span className="font-black italic text-primary">DPS</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl italic">
          Remplissez ce formulaire pour nous transmettre les détails de votre événement.
          Notre responsable opérationnel reviendra vers vous avec une proposition adaptée.
        </p>
      </div>

      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/*  COORDONNÉES DE L'ORGANISATEUR */}
        <section className="md:col-span-2 p-8 bg-white dark:bg-[#001A3D] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
            <Building2 className="text-primary" size={20} />
            <h2 className="font-black uppercase text-xs tracking-widest">Coordonnées de l'Organisateur</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Organisme / Structure</label>
              <Input
                name="organismeDemandeur"
                required
                placeholder="Ex: Mairie de Six-Fours, Association..."
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom du contact sur place</label>
              <Input
                name="nomContact"
                required
                placeholder="Prénom et Nom"
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Téléphone de contact</label>
              <Input
                name="telephoneContact"
                required
                type="tel"
                placeholder="06 00 00 00 00"
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email de contact</label>
              <Input
                name="emailContact"
                required
                type="email"
                placeholder="contact@email.com"
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
        </section>


        {/* BLOC 1 : L'ÉVÉNEMENT */}
        <section className="p-8 bg-white dark:bg-[#001A3D] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
            <Calendar className="text-primary" size={20} />
            <h2 className="font-black uppercase text-xs tracking-widest">L'Événement</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom de l'événement</label>
              <Input
                name="title"
                required
                placeholder="Ex: Tournoi de Judo, Concert..."
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type d'événement</label>
              <Select onValueChange={setEventType} required>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent className={selectContentStyle}>
                  <SelectItem value="SPORT" className="py-2">Sportif</SelectItem>
                  <SelectItem value="CULTURE" className="py-2">Culturel / Concert</SelectItem>
                  <SelectItem value="RECU" className="py-2">Réunion / Congrès</SelectItem>
                  <SelectItem value="FETE" className="py-2">Fête de village / Kermesse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 🪛 MODE CLAIR ET SOMBRE DYNAMIQUES 🪛 */}
            <div className="grid grid-cols-1 gap-4">

              {/* Date & Heure Début */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Début (Date & Heure)</label>
                <div className="flex gap-2">
                  <Input
                    name="dateDebut"
                    required
                    type="date"
                    className="rounded-xl border-slate-200 w-full text-left bg-transparent text-slate-900 dark:text-white"
                  />
                  <Input
                    name="heureDebut"
                    required
                    type="time"
                    className="rounded-xl border-slate-200 w-32 shrink-0 text-left bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Date & Heure Fin */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fin (Date & Heure)</label>
                <div className="flex gap-2">
                  <Input
                    name="dateFin"
                    required
                    type="date"
                    className="rounded-xl border-slate-200 w-full text-left bg-transparent text-slate-900 dark:text-white"
                  />
                  <Input
                    name="heureFin"
                    required
                    type="time"
                    className="rounded-xl border-slate-200 w-32 shrink-0 text-left bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* BLOC 2 : LOCALISATION & CONFIGURATION */}
        <section className="p-8 bg-white dark:bg-[#001A3D] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
            <MapPin className="text-primary" size={20} />
            <h2 className="font-black uppercase text-xs tracking-widest">Localisation & Logistique</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Adresse précise</label>
              <Input name="location" required placeholder="Rue, Stade, Gymnase..." className="rounded-xl border-slate-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Configuration</label>
                <Select onValueChange={setConfigLocation} required>
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Lieu de l'événement" />
                  </SelectTrigger>
                  <SelectContent className={selectContentStyle}>
                    <SelectItem value="PLEIN_AIR" className="py-2">En plein air (Ouvert)</SelectItem>
                    <SelectItem value="ETABLISSEMENT" className="py-2">Établissement clos</SelectItem>
                    <SelectItem value="MIXTE" className="py-2">Mixte (Intérieur & Extérieur)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Public attendu</label>
                <Input name="public" required type="number" placeholder="Nbre max. simultané" className="rounded-xl border-slate-200" />

                {/* 🆕 NOTE D'INFORMATION */}
                <p className="text-[9px] text-slate-500 leading-relaxed italic pl-1 bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                  {/* 🆕 NOTE D'INFORMATION */}
                  <p className="text-[9px] text-slate-500 leading-relaxed italic pl-1 bg-slate-50 dark:bg-white/5 p-2 rounded-lg border border-slate-100 dark:border-white/5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Public :</span> Nombre de personnes qui <span className="text-red-600 font-semibold not-italic">assistent</span> à un spectacle, une manifestation, un rendez-vous sportif, une réunion, ... <br />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Acteurs :</span> Nombre de personnes qui <span className="text-red-600 font-semibold not-italic">participent et concourent</span> à la manifestation : sportifs, artistes, organisateurs, bénévoles, ... <br />
                  </p>
                </p>
              </div>
            </div>

            {/* NOUVEAUX CHAMPS : SUPERFICIE ET DISTANCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Superficie du site</label>
                <Input name="superficie" placeholder="Ex: 500 m², 2 hectares..." className="rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Distance max. (2 points opposés)</label>
                <Input name="distanceMaxi" placeholder="Ex: 150 mètres" className="rounded-xl border-slate-200" />
              </div>
            </div>

            {/* NOUVEAU CHAMP : ABRI FOURNI */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-start space-x-3">
              <Checkbox id="fournitLocal" name="fournitLocal" className="mt-1" />
              <div className="space-y-1 leading-none">
                <label htmlFor="fournitLocal" className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer">
                  L'organisateur met à disposition un abri (Local, Tente...)
                </label>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                  Cochez cette case si vous disposez d'un espace fermé pour installer le poste de secours. <br />
                  <span className="italic text-amber-600 dark:text-amber-500">Dans le cas contraire, une tente vous sera fournie et facturée.</span>
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* BLOC 3 : ÉVALUATION DES RISQUES (P2, E1, E2) */}
        <section className="md:col-span-2 p-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-primary/20 shadow-inner space-y-8">
          <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
            <AlertCircle className="text-primary" size={22} />
            <div className="flex flex-col">
              <h2 className="font-black uppercase text-sm tracking-widest">Évaluation des Risques</h2>
              <p className="text-[10px] text-slate-500 italic">Ces informations sont essentielles pour le calcul de votre dispositif</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ambiance (P2) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Activity size={16} />
                <label className="text-[10px] font-black uppercase tracking-widest">Type d'activité (P2)</label>
              </div>
              <Select onValueChange={setAmbiance} required>
                <SelectTrigger className="rounded-xl border-slate-200 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Comportement du public" />
                </SelectTrigger>
                <SelectContent className={selectContentStyle}>
                  <SelectItem value="Calme">Assis (cérémonie, spectacle, ...)</SelectItem>
                  <SelectItem value="Peu dynamique">Debout statique (foire, ...)</SelectItem>
                  <SelectItem value="Dynamique">Debout dynamique (fête foraine, ...)</SelectItem>
                  <SelectItem value="Très dynamique">Debout très dynamique (dance, féria, ...)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Accessibilité (E1) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Scaling size={16} />
                <label className="text-[10px] font-black uppercase tracking-widest">Environnement (E1)</label>
              </div>
              <Select onValueChange={setAccessibilite} required>
                <SelectTrigger className="rounded-xl border-slate-200 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Caractéristiques" />
                </SelectTrigger>
                <SelectContent className={selectContentStyle}>
                  <SelectItem value="Facile">Structure permanente, voie publique</SelectItem>
                  <SelectItem value="Intermédiaire">Structure non permanente, espaces naturel -2 ha avec peu de pente</SelectItem>
                  <SelectItem value="Difficile">Espace naturel -5ha avec de la pente</SelectItem>
                  <SelectItem value="Complexe">Espace naturel accidenté + de 5ha, progression des secours rendue difficile par le public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Délai (E2) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Stethoscope size={16} />
                <label className="text-[10px] font-black uppercase tracking-widest">Secours publics (E2)</label>
              </div>
              <Select onValueChange={setDelaiSecours} required>
                <SelectTrigger className="rounded-xl border-slate-200 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Délai d'intervention" />
                </SelectTrigger>
                <SelectContent className={selectContentStyle}>
                  <SelectItem value="Moins de 10 minutes">Moins de 10 minutes</SelectItem>
                  <SelectItem value="10-20 minutes">10 à 20 minutes</SelectItem>
                  <SelectItem value="20-30 minutes">20 à 30 minutes</SelectItem>
                  <SelectItem value="Plus de 30 minutes">Plus de 30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* BLOC 4 : DÉTAILS OPÉRATIONNELS */}
        <section className="md:col-span-2 p-8 bg-white dark:bg-[#001A3D] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
            <Clock className="text-primary" size={20} />
            <h2 className="font-black uppercase text-xs tracking-widest">Détails & Horaires</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description précise de l'événement</label>
                <Textarea
                  name="description"
                  required
                  placeholder="Expliquez-nous le déroulement, les risques particuliers..."
                  className="rounded-2xl border-slate-200 min-h-[120px]"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 space-y-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-primary">
                <AlertCircle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Note</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                Ces informations nous permettent de générer une grille d'évaluation des risques et de dimensionner le Dispositif de Premiers Secours à personnes le plus adapté.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
          >
            <Send size={18} className="mr-2" />
            {loading ? "Envoi en cours..." : "Envoyer la demande de devis"}
          </Button>
        </section>
      </form>
    </div >
  );
}