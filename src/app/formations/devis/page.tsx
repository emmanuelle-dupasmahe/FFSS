"use client";

import { useState, useEffect, Suspense } from "react";
import {
    GraduationCap,
    ShieldCheck,
    FileCheck,
    MessageSquare,
    Send,
    HelpCircle,
    User,
    Building2,
    RefreshCw,
    MapPin,
    AlertTriangle,
    Waves,
    Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { createInscription } from "@/app/actions/formations";
import { useRouter, useSearchParams } from "next/navigation";

function DevisFormationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [isStructure, setIsStructure] = useState(false);
    const [diplomeVise, setDiplomeVise] = useState("");
    const [typeFormation, setTypeFormation] = useState("INITIALE");

    const [formations, setFormations] = useState<any[]>([]);
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState("");

    const [hasPSE1, setHasPSE1] = useState(false);
    const [hasPSE2, setHasPSE2] = useState(false);
    const [hasBNSSA, setHasBNSSA] = useState(false);
    const [needRecyclage, setNeedRecyclage] = useState(false);

    useEffect(() => {
        fetch('/api/formations-list')
            .then((res) => res.json())
            .then((data) => {
                setFormations(data);

                const preselectedFormation = searchParams.get("formation");
                if (preselectedFormation) {
                    const titleUpper = preselectedFormation.toUpperCase();
                    if (titleUpper.includes("RECYCLAGE") || titleUpper.includes("MAC") || titleUpper.includes("MAINTIEN")) {
                        setTypeFormation("RECYCLAGE");
                    }

                    setDiplomeVise(preselectedFormation);
                }
            })
            .catch(() => toast.error("Impossible de charger le catalogue des formations"));
    }, [searchParams]);

    useEffect(() => {
        if (!searchParams.get("formation") || diplomeVise !== searchParams.get("formation")) {
            setDiplomeVise("");
            setSelectedSessionId("");
            setSessions([]);
        }
    }, [typeFormation]);

    useEffect(() => {
        if (!diplomeVise || formations.length === 0) return;

        setSelectedSessionId("");
        setSessions([]);

        const match = formations.find((f: any) => f.title === diplomeVise);

        if (match) {
            fetch(`/api/sessions?formationId=${match.id}`)
                .then(res => res.json())
                .then(data => setSessions(data))
                .catch(() => toast.error("Erreur lors du chargement des sessions"));
        }
    }, [diplomeVise, formations]);

    // 🪛 CORRECTION : On déplace ce filtre AVANT la fonction d'envoi pour que le bouton puisse l'utiliser !
    const upcomingSessions = sessions.filter((s: any) => {
        const sessionDate = new Date(s.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sessionDate >= today;
    });

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // 🪛 CORRECTION : On vérifie `upcomingSessions` (les dates affichées) et plus `sessions` (toutes les dates)
        if (!isStructure && upcomingSessions.length > 0 && !selectedSessionId) {
            return toast.error("Veuillez sélectionner une session (date de formation).");
        }

        setLoading(true);

        const formData = new FormData(event.currentTarget);
        // On récupère la formation sélectionnée pour envoyer son ID exact
        const match = formations.find((f: any) => f.title === diplomeVise);
        if (match) {
            formData.append("formationId", match.id);
        }
        formData.append("type", isStructure ? "STRUCTURE" : "INDIVIDUEL");
        formData.append("diplomeVise", diplomeVise);
        formData.append("typeFormation", typeFormation);
        formData.append("hasPSE1", hasPSE1.toString());
        formData.append("hasPSE2", hasPSE2.toString());
        formData.append("hasBNSSA", hasBNSSA.toString());
        formData.append("needRecyclage", needRecyclage.toString());

        // 🪛 SÉCURITÉ : N'envoyer l'ID de session que si on l'a vraiment sélectionné
        if (selectedSessionId) {
            formData.append("sessionId", selectedSessionId);
        }

        const result = await createInscription(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Demande de devis transmise avec succès !");
            // 🪛 CORRECTION : Redirection vers l'espace du candidat, pas vers l'administration !
            router.push("/profile");
        }
        setLoading(false);
    }

    const messagePlaceholder = isStructure
        ? "Indiquez ici les profils des stagiaires, les dates souhaitées pour le groupe ou si vous avez besoin d'une formation dans vos locaux..."
        : "Précisez votre situation : êtes-vous licencié en club ? Votre PSE1/PSE2 est-il à jour ? Des précisions particulières ?";

    const formationsFiltrees = formations.filter((f: any) => {
        const titleUpper = f.title.toUpperCase();
        const isRecyclage = titleUpper.includes("RECYCLAGE") || titleUpper.includes("MAC") || titleUpper.includes("MAINTIEN");
        return typeFormation === "RECYCLAGE" ? isRecyclage : !isRecyclage;
    });

    const isSSA = diplomeVise.toUpperCase().includes("SSA") && !diplomeVise.toUpperCase().includes("BNSSA");
    const isPSE2 = diplomeVise.toUpperCase().includes("PSE2") || diplomeVise.toUpperCase().includes("PSE 2");

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-10 animate-in fade-in duration-500">
            {/* Header avec Switch Particulier/Structure */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        <GraduationCap size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Service Formation ASSTSF</span>
                    </div>
                    <h1 className="text-4xl font-light uppercase tracking-tighter">
                        Demande de <span className="font-black italic text-primary">Devis</span>
                    </h1>
                </div>

                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setIsStructure(false)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${!isStructure ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-md scale-105' : 'text-slate-500'}`}
                    >
                        <User size={14} /> Particulier
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsStructure(true)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${isStructure ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-md scale-105' : 'text-slate-500'}`}
                    >
                        <Building2 size={14} /> Structure
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SECTION STRUCTURE (Conditionnelle) */}
                {isStructure && (
                    <section className="md:col-span-2 p-8 bg-primary/5 rounded-[2.5rem] border-2 border-primary/20 space-y-6 animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
                            <Building2 className="text-primary" size={20} />
                            <h2 className="font-black uppercase text-xs tracking-widest text-primary">Informations Structure</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom de la structure</Label>
                                <Input name="structureName" required={isStructure} placeholder="Entreprise, Asso, Club..." className="rounded-xl border-slate-200 bg-white dark:bg-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SIRET</Label>
                                <Input name="siret" placeholder="14 chiffres (facultatif)" className="rounded-xl border-slate-200 bg-white dark:bg-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre de stagiaires</Label>
                                <Input name="participants" type="number" defaultValue={1} min={1} className="rounded-xl border-slate-200 bg-white dark:bg-slate-900" />
                            </div>
                        </div>
                    </section>
                )}

                {/* SECTION 1 : FORMATION */}
                <section className="p-8 bg-white dark:bg-[#001A3D] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                        <ShieldCheck className="text-primary" size={20} />
                        <h2 className="font-black uppercase text-xs tracking-widest text-slate-900 dark:text-white">Votre Projet</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type de formation</Label>
                            <Select name="typeFormation" value={typeFormation} onValueChange={setTypeFormation}>
                                <SelectTrigger className="rounded-xl border-slate-200 bg-transparent text-slate-900 dark:text-white">
                                    <SelectValue placeholder="Initiale ou Recyclage ?" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-xl">
                                    <SelectItem value="INITIALE" className="py-3">Formation Initiale</SelectItem>
                                    <SelectItem value="RECYCLAGE" className="py-3">Recyclage / Continue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diplôme visé</Label>
                            <Select value={diplomeVise} onValueChange={setDiplomeVise} required>
                                <SelectTrigger className="rounded-xl border-slate-200 bg-transparent text-slate-900 dark:text-white">
                                    <SelectValue placeholder="Sélectionner le diplôme" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-xl">
                                    {formationsFiltrees.map((f: any) => (
                                        <SelectItem key={f.id} value={f.title} className="py-3 font-bold">
                                            {f.title}
                                        </SelectItem>
                                    ))}
                                    {formationsFiltrees.length === 0 && (
                                        <div className="p-3 text-xs text-slate-500 italic">Aucune formation trouvée</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* CHOIX DE LA SESSION */}
                        {!isStructure && diplomeVise && (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dates de session disponibles</Label>
                                <Select onValueChange={setSelectedSessionId} value={selectedSessionId} required={upcomingSessions.length > 0}>
                                    <SelectTrigger className="rounded-xl border-slate-200 bg-transparent text-slate-900 dark:text-white h-12">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-slate-400" />
                                            <SelectValue placeholder={upcomingSessions.length === 0 ? "Aucune date disponible" : "Choisir une date"} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-xl">
                                        {upcomingSessions.map((s: any) => {
                                            const start = new Date(s.startDate).toLocaleDateString();
                                            const end = s.endDate ? new Date(s.endDate).toLocaleDateString() : start;
                                            const txt = start === end ? `Le ${start} ${s.details ? `(${s.details})` : ''}` : `Du ${start} au ${end} ${s.details ? `(${s.details})` : ''}`;
                                            return (
                                                <SelectItem key={s.id} value={s.id} className="py-3 text-xs">
                                                    {txt}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {upcomingSessions.length === 0 && (
                                    <p className="text-[10px] text-amber-600 italic">
                                        Aucune session n'est planifiée pour le moment. Vous pouvez envoyer la demande, nous vous proposerons des dates.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION 2 : ACQUIS DYNAMIQUES */}
                <section className="p-8 bg-white dark:bg-[#001A3D] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                        <FileCheck className="text-primary" size={20} />
                        <h2 className="font-black uppercase text-xs tracking-widest text-slate-900 dark:text-white">Acquis & Prérequis</h2>
                    </div>

                    <div className="space-y-3">
                        {!isStructure ? (
                            <>
                                {isSSA && (
                                    <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 animate-in zoom-in-95">
                                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-[9px] text-amber-700 dark:text-amber-400 font-bold leading-tight uppercase italic">
                                            Le SSA nécessite impérativement le BNSSA et le PSE2 à jour.
                                        </p>
                                    </div>
                                )}

                                {isSSA && (
                                    <div onClick={() => setHasBNSSA(!hasBNSSA)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${hasBNSSA ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'}`}>
                                        <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${hasBNSSA ? 'bg-primary border-primary' : 'bg-white dark:bg-slate-800 border-slate-300'}`}>
                                            {hasBNSSA && <div className="h-2 w-3 border-l-2 border-b-2 border-white -rotate-45 mb-1" />}
                                        </div>
                                        <div className="grid gap-0.5"><span className={`text-[11px] font-black uppercase ${hasBNSSA ? 'text-primary' : 'text-slate-600'}`}>Je possède le BNSSA</span></div>
                                    </div>
                                )}

                                <div onClick={() => setHasPSE1(!hasPSE1)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${hasPSE1 ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'}`}>
                                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${hasPSE1 ? 'bg-primary border-primary' : 'bg-white dark:bg-slate-800 border-slate-300'}`}>
                                        {hasPSE1 && <div className="h-2 w-3 border-l-2 border-b-2 border-white -rotate-45 mb-1" />}
                                    </div>
                                    <div className="grid gap-0.5"><span className={`text-[11px] font-black uppercase ${hasPSE1 ? 'text-primary' : 'text-slate-600'}`}>Je possède le PSE1</span></div>
                                </div>

                                {(isSSA || isPSE2) && (
                                    <div onClick={() => setHasPSE2(!hasPSE2)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer animate-in slide-in-from-left-2 transition-all ${hasPSE2 ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'}`}>
                                        <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${hasPSE2 ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-800 border-slate-300'}`}>
                                            {hasPSE2 && <div className="h-2 w-3 border-l-2 border-b-2 border-white -rotate-45 mb-1" />}
                                        </div>
                                        <div className="grid gap-0.5"><span className={`text-[11px] font-black uppercase ${hasPSE2 ? 'text-emerald-600' : 'text-slate-600'}`}>Je possède le PSE2</span></div>
                                    </div>
                                )}

                                {(hasPSE1 || hasPSE2) && (
                                    <div onClick={() => setNeedRecyclage(!needRecyclage)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer animate-in slide-in-from-top-2 duration-300 transition-all ${needRecyclage ? 'border-amber-500 bg-amber-500/10' : 'border-amber-500/30 bg-amber-500/5'}`}>
                                        <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${needRecyclage ? 'bg-amber-500 border-amber-500' : 'bg-white dark:bg-slate-800 border-amber-500/50'}`}>
                                            {needRecyclage && <RefreshCw size={14} className="text-white" />}
                                        </div>
                                        <div className="grid gap-0.5">
                                            <span className={`text-[11px] font-black uppercase ${needRecyclage ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>Mon PSE doit être recyclé</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 pt-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Niveau de nage</Label>
                                    <Select name="swimLevel">
                                        <SelectTrigger className="rounded-xl border-slate-200 bg-transparent text-slate-900 dark:text-white h-12">
                                            <SelectValue placeholder="Évaluez votre niveau" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-xl">
                                            <SelectItem value="CLUB" className="py-3 font-bold text-blue-500">Licencié en club</SelectItem>
                                            <SelectItem value="REGULIER" className="py-3">Nageur régulier</SelectItem>
                                            <SelectItem value="DEBUTANT" className="py-3">Débutant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3 italic">
                                    <HelpCircle className="text-primary shrink-0" size={16} />
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                        Nous adaptons le contenu aux besoins de votre structure. Le SSA nécessite des prérequis BNSSA/PSE2 pour les candidats.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lieu de formation souhaité</Label>
                                    <Select name="location">
                                        <SelectTrigger className="rounded-xl border-slate-200 bg-transparent text-slate-900 dark:text-white h-12">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="text-slate-400" size={16} />
                                                <SelectValue placeholder="Où se déroule la formation ?" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-xl">
                                            <SelectItem value="Vos locaux" className="py-3">Vos locaux</SelectItem>
                                            <SelectItem value="Nos locaux" className="py-3">Nos locaux</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl flex gap-3 items-start">
                                        <div className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-lg shrink-0">
                                            <Waves size={16} className="text-blue-600 dark:text-blue-200" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase text-blue-800 dark:text-blue-200">Pour la piscine </p>
                                            <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-1">
                                                <strong>Piscine militaire de Jauréguiberry (Toulon)</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION FINALE */}
                <section className="md:col-span-2 p-8 bg-white dark:bg-[#001A3D] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-lg space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                        <MessageSquare className="text-primary" size={20} />
                        <h2 className="font-black uppercase text-xs tracking-widest text-slate-900 dark:text-white">Précisions finales</h2>
                    </div>
                    <Textarea
                        name="message"
                        placeholder={messagePlaceholder}
                        className="rounded-2xl border-slate-200 bg-transparent min-h-[120px] focus:ring-primary"
                    />
                    <Button type="submit" disabled={loading} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                        {loading ? <RefreshCw className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                        Envoyer ma demande de devis
                    </Button>
                </section>
            </form>
        </div>
    );
}

// 🪛 EXPORT PAR DÉFAUT ENVELOPPÉ DANS UN SUSPENSE
export default function DevisFormationPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-slate-500 animate-pulse text-xs tracking-widest uppercase font-bold">Chargement du formulaire...</div>}>
            <DevisFormationForm />
        </Suspense>
    );
}