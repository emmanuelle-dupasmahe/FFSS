"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Save, Eye, EyeOff, Plus, Trash2, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import FormationInscrits from "@/components/admin/FormationInscrits";
import FormationRessources from "@/components/admin/FormationRessources";
import FormationSessions from "@/components/admin/FormationSessions";

interface Formation {
  id: string;
  [key: string]: any;
}

export default function AdminFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [localFormations, setLocalFormations] = useState<{ [key: string]: any }>({});

  // 🪛 NOUVEAU : État pour garder en mémoire la formation sélectionnée dans le menu
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const res = await fetch('/api/formations-list');
      const data = await res.json();
      setFormations(data);

      const localData = data.reduce((acc: any, f: Formation) => {
        acc[f.id] = { ...f };
        return acc;
      }, {});
      setLocalFormations(localData);

      // Si aucune formation n'est sélectionnée, on sélectionne la première par défaut
      if (data.length > 0 && !selectedId) {
        const sortedData = sortFormationsList(data);
        setSelectedId(sortedData[0].id);
      }
    } catch (err) {
      toast.error("Impossible de charger les formations");
    } finally {
      setLoading(false);
    }
  };

  // 🪛 NOUVEAU : Fonction de tri extraite pour être utilisable par le menu
  const sortFormationsList = (list: Formation[]) => {
    return [...list].sort((a, b) => {
      const isRecyclageA = a.title.toLowerCase().includes("recyclage") || a.title.toLowerCase().includes("mac");
      const isRecyclageB = b.title.toLowerCase().includes("recyclage") || b.title.toLowerCase().includes("mac");

      if (isRecyclageA && !isRecyclageB) return 1;
      if (!isRecyclageA && isRecyclageB) return -1;
      return 0;
    });
  };

  const handleUpdate = async (id: string, data: Partial<Formation>) => {
    try {
      const res = await fetch(`/api/formations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        toast.success("Formation mise à jour !");
        fetchFormations();
      }
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Attention : Supprimer cette formation est irréversible. Confirmer ?")) return;
    try {
      const res = await fetch(`/api/formations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Formation supprimée avec succès");
        setSelectedId(null); // On réinitialise la sélection
        fetchFormations();
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/formations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "NOUVELLE FORMATION", isActive: false, slug: `nouvelle-formation-${Date.now()}` }),
      });
      if (res.ok) {
        toast.success("Une nouvelle ligne a été créée !");
        fetchFormations();
      }
    } catch (err) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleInputChange = (id: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalFormations(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [name]: name === 'price' || name === 'ageMin' ? (value === '' ? null : parseFloat(value)) : value,
      }
    }));
  };

  if (loading) return <div className="p-10 text-center text-slate-500 uppercase tracking-widest text-xs font-bold">Chargement...</div>;

  const sortedFormations = sortFormationsList(formations);
  const selectedFormation = sortedFormations.find(f => f.id === selectedId);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Gestion des Formations</h1>
          <p className="text-sm text-slate-500 font-light">Gérez vos contenus pédagogiques et épreuves.</p>
        </div>
        <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] px-6 py-4 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Ajouter une formation
        </Button>
      </div>

      {/* 🪛 NOUVEAU : MENU DES FORMATIONS (Responsive, défilable horizontalement) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-border/50">
        {sortedFormations.map((f: Formation) => (
          <Button
            key={f.id}
            onClick={() => setSelectedId(f.id)}
            variant={selectedId === f.id ? "default" : "outline"}
            className={`whitespace-nowrap transition-all duration-300 ${selectedId === f.id
                ? "bg-primary text-white shadow-md font-bold scale-105"
                : "bg-card text-slate-500 hover:text-primary hover:bg-primary/5"
              }`}
          >
            <BookOpen className="w-3 h-3 mr-2 opacity-70" />
            {f.title}
          </Button>
        ))}
      </div>

      {/* ZONE DE CONTENU (Affiche uniquement la formation sélectionnée) */}
      <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {selectedFormation && (
          <div key={selectedFormation.id} className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm transition-all">

            {/* HEADER DE LA CARTE */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded ${selectedFormation.title.toLowerCase().includes("recyclage") ? "bg-red-500 text-white" : "bg-primary text-white"}`}>
                  {selectedFormation.title.toLowerCase().includes("recyclage") ? "📍 Recyclage" : "📘 Initiale"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono italic">ID: {selectedFormation.id.slice(-6)}</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button className="flex-1 md:flex-none" variant={selectedFormation.isActive ? "default" : "outline"} size="sm" onClick={() => handleUpdate(selectedFormation.id, { isActive: !localFormations[selectedFormation.id].isActive })}>
                  {selectedFormation.isActive ? <Eye className="w-3 h-3 mr-2" /> : <EyeOff className="w-3 h-3 mr-2" />}
                  {selectedFormation.isActive ? "Visible" : "Masquée"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedFormation.id)}><Trash2 size={14} /></Button>
              </div>
            </div>

            {/* FORMULAIRE DE BASE AVEC LABELS CLAIRS */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block tracking-widest pl-1">Titre de la formation</label>
                  <Input name="title" defaultValue={selectedFormation.title} onChange={(e) => handleInputChange(selectedFormation.id, e)} className="font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block tracking-widest pl-1">Sous-titre (ex: Secouriste)</label>
                  <Input name="subtitle" defaultValue={selectedFormation.subtitle} onChange={(e) => handleInputChange(selectedFormation.id, e)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block tracking-widest pl-1">Prix (€)</label>
                  <Input name="price" type="number" defaultValue={selectedFormation.price} onChange={(e) => handleInputChange(selectedFormation.id, e)} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block tracking-widest pl-1">Durée (ex: 35h)</label>
                  <Input name="duration" defaultValue={selectedFormation.duration} onChange={(e) => handleInputChange(selectedFormation.id, e)} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block tracking-widest pl-1">Âge minimum</label>
                  <Input name="ageMin" type="number" defaultValue={selectedFormation.ageMin} onChange={(e) => handleInputChange(selectedFormation.id, e)} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-primary mb-1.5 block tracking-widest pl-1">Public / Prérequis</label>
                  <Input
                    name="target"
                    defaultValue={selectedFormation.details?.target || ""}
                    onChange={(e) => handleInputChange(selectedFormation.id, e)}
                    className="border-primary/30 bg-primary/5"
                  />
                </div>
              </div>
            </div>

            {/* ACCORDION POUR LES SECTIONS LOURDES */}
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="description" className="border rounded-xl px-4">
                <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Descriptions & Programme
                </AccordionTrigger>
                <AccordionContent className="space-y-4 p-2">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block tracking-widest pl-1">Description courte (sur la carte)</label>
                    <Textarea name="description" defaultValue={selectedFormation.description} onChange={(e) => handleInputChange(selectedFormation.id, e)} rows={3} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block tracking-widest pl-1">Présentation complète (Popup)</label>
                    <Textarea name="descriptionDetaillee" defaultValue={selectedFormation.descriptionDetaillee} onChange={(e) => handleInputChange(selectedFormation.id, e)} rows={8} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block tracking-widest pl-1">Programme et Épreuves</label>
                    <Textarea name="epreuves" defaultValue={selectedFormation.epreuves} onChange={(e) => handleInputChange(selectedFormation.id, e)} rows={5} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="inscrits" className="border rounded-xl px-4">
                <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gestion des inscrits</AccordionTrigger>
                <AccordionContent className="h-auto overflow-visible">
                    <FormationInscrits inscriptions={selectedFormation.inscriptions || []} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ressources" className="border rounded-xl px-4">
                <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ressources & PDF</AccordionTrigger>
                <AccordionContent><FormationRessources formationId={selectedFormation.id} initialRessources={selectedFormation.ressources || []} /></AccordionContent>
              </AccordionItem>

              <AccordionItem value="sessions" className="border rounded-xl px-4">
                <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Sessions de formation
                </AccordionTrigger>
                <AccordionContent className="h-auto overflow-visible">
                  <FormationSessions formationId={selectedFormation.id} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="pt-8 flex justify-end">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] px-10 py-6 w-full md:w-auto" onClick={() => handleUpdate(selectedFormation.id, localFormations[selectedFormation.id])}>
                <Save className="w-4 h-4 mr-2" /> Enregistrer les modifications
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}