"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfileFFSS, signFormationDevis } from "@/app/actions/inscriptions";
import { User, MapPin, Calendar, PenTool, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SignInscriptionClient({ inscription }: { inscription: any }) {
    const user = inscription.user;
    const isStructure = inscription.typeDemande === "STRUCTURE";
    // États du formulaire
    const [birthDate, setBirthDate] = useState(user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "");
    const [birthPlace, setBirthPlace] = useState(user.birthPlace || "");
    const [address, setAddress] = useState(user.address || "");
    const [zipCode, setZipCode] = useState(user.zipCode || "");
    const [city, setCity] = useState(user.city || "");
    const [phone, setPhone] = useState(user.phone || "");

    // États de l'application
    // 🪛 MODIFIÉ : Si c'est une structure, on valide l'étape 1 d'office
    const [isProfileComplete, setIsProfileComplete] = useState(
        isStructure ? true : !!(user.birthDate && user.birthPlace && user.address && user.zipCode && user.city)
    );

    const [step, setStep] = useState(
        inscription.isDevisSigned ? 3 : (isProfileComplete ? 2 : 1)
    );
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSigning, setIsSigning] = useState(false);

    // Canvas pour la signature
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Initialisation du Canvas pour la signature tactile/souris
    useEffect(() => {
        if (step === 2 && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
            }
        }
    }, [step]);

    // Fonctions de dessin sur le Canvas
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;

        if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    // Soumission de l'état civil
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);

        const res = await updateProfileFFSS(user.id, {
            birthDate,
            birthPlace,
            address,
            zipCode,
            city,
            phone
        });

        setIsSavingProfile(false);
        if (res.success) {
            setIsProfileComplete(true);
            setStep(2);
        } else {
            alert("Erreur lors de l'enregistrement de vos informations.");
        }
    };

    // Soumission de la signature
    const handleSignDevis = async () => {
        if (!canvasRef.current) return;

        // On convertit le dessin du canvas en image Base64
        const signatureDataUrl = canvasRef.current.toDataURL("image/png");

        // Petite vérification pour s'assurer que le canvas n'est pas complètement vide
        const blank = document.createElement('canvas');
        blank.width = canvasRef.current.width;
        blank.height = canvasRef.current.height;
        if (signatureDataUrl === blank.toDataURL("image/png")) {
            alert("Veuillez apposer votre signature dans le cadre prévu.");
            return;
        }

        setIsSigning(true);
        const res = await signFormationDevis(inscription.id, signatureDataUrl);
        setIsSigning(false);

        if (res.success) {
            // Bascule sur l'écran de succès de commande au lieu de rediriger brutalement
            setStep(3);
        } else {
            alert(res.message || "Une erreur est survenue lors de la signature.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Onglets indicateurs d'étapes */}
            {step !== 3 && (
                <div className="flex items-center gap-4 border-b border-border pb-1">
                    {!isStructure && (
                        <button
                            disabled={isProfileComplete}
                            onClick={() => setStep(1)}
                            className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${step === 1 ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
                        >
                            1. Informations FFSS {isProfileComplete && "✓"}
                        </button>
                    )}
                    <button
                        disabled={!isProfileComplete}
                        onClick={() => setStep(2)}
                        className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${step === 2 ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
                    >
                        {isStructure ? "1. Signature Électronique" : "2. Signature Électronique"}
                    </button>
                </div>
            )}

            {/* ÉTAPE 1 : FORMULAIRE ÉTAT CIVIL */}
            {step === 1 && (
                <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 p-4 rounded-2xl flex gap-3 text-amber-800 dark:text-amber-400">
                        <AlertTriangle className="shrink-0" size={20} />
                        <p className="text-xs font-medium leading-relaxed">
                            Ces informations réglementaires sont obligatoires afin de pouvoir générer votre licence auprès de la <strong>Fédération Française de Sauvetage et de Secourisme (FFSS)</strong>.
                        </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date de naissance</Label>
                                <Input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-slate-50 dark:bg-black/10 h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lieu de naissance</Label>
                                <Input placeholder="Ex: Marseille (13)" required value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="bg-slate-50 dark:bg-black/10 h-12 rounded-xl" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adresse postale</Label>
                            <Input placeholder="Ex: 12 Rue de la République" required value={address} onChange={(e) => setAddress(e.target.value)} className="bg-slate-50 dark:bg-black/10 h-12 rounded-xl" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Code Postal</Label>
                                <Input placeholder="Ex: 83000" required value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="bg-slate-50 dark:bg-black/10 h-12 rounded-xl" />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ville</Label>
                                <Input placeholder="Ex: Toulon" required value={city} onChange={(e) => setCity(e.target.value)} className="bg-slate-50 dark:bg-black/10 h-12 rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Téléphone</Label>
                            <Input type="tel" placeholder="Ex: 06 12 34 56 78" required value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-50 dark:bg-black/10 h-12 rounded-xl" />
                        </div>

                        <Button type="submit" disabled={isSavingProfile} className="w-full h-12 rounded-xl uppercase font-black text-[10px] tracking-widest bg-primary hover:bg-primary/90 text-white mt-4 shadow-md">
                            {isSavingProfile ? "Enregistrement..." : "Valider et passer à la signature"}
                        </Button>
                    </form>
                </div>
            )}

            {/* ÉTAPE 2 : PAD DE SIGNATURE */}
            {step === 2 && (
                <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 p-4 rounded-2xl flex gap-3 text-emerald-800 dark:text-emerald-400">
                        <CheckCircle2 className="shrink-0" size={20} />
                        <p className="text-xs font-medium leading-relaxed">
                            Vos informations d'état civil FFSS sont complétées. Veuillez relire votre devis ci-dessous avant d'apposer votre signature électronique.
                        </p>
                    </div>

                    {/* AFFICHAGE DU DEVIS PDF EN DIRECT */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                            <FileText size={12} className="text-primary" /> Visualisation de votre devis de formation
                        </Label>

                        {inscription.devisUrl ? (
                            <div className="border border-border rounded-2xl overflow-hidden h-[450px] bg-slate-100 dark:bg-black/20 shadow-inner">
                                <iframe
                                    src={`${inscription.devisUrl}#toolbar=0`}
                                    className="w-full h-full"
                                    title="Prévisualisation du devis de formation"
                                />
                            </div>
                        ) : (
                            <div className="p-8 bg-slate-50 dark:bg-black/10 rounded-2xl border border-dashed border-border text-center text-xs text-slate-400 italic">
                                Aucun document de devis n'est associé à ce dossier. Contactez l'administration.
                            </div>
                        )}
                    </div>

                    {/* Zone tactile de dessin */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                <PenTool size={12} /> Votre Signature Électronique
                            </Label>
                            <button onClick={clearCanvas} type="button" className="text-[9px] font-bold uppercase text-red-500 hover:underline">
                                Effacer
                            </button>
                        </div>
                        <div className="border border-slate-300 dark:border-white/10 rounded-2xl overflow-hidden bg-white shadow-inner h-44 relative">
                            <canvas
                                ref={canvasRef}
                                width={650}
                                height={176}
                                onMouseDown={startDrawing}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onMouseMove={draw}
                                onTouchStart={startDrawing}
                                onTouchEnd={stopDrawing}
                                onTouchMove={draw}
                                className="w-full h-full cursor-crosshair touch-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border-border">
                            Précédent
                        </Button>
                        <Button onClick={handleSignDevis} disabled={isSigning || !inscription.devisUrl} className="flex-1 h-12 rounded-xl uppercase font-black text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50">
                            {isSigning ? "Validation en cours..." : "Confirmer et signer le dossier"}
                        </Button>
                    </div>
                </div>
            )}

            {/* ÉTAPE 3 : ÉCRAN DE SUCCÈS ET TÉLÉCHARGEMENT DIRECT */}
            {step === 3 && (
                <div className="bg-card border border-emerald-200 dark:border-emerald-500/30 rounded-[2rem] p-8 md:p-16 text-center space-y-6 shadow-sm animate-in zoom-in-95 duration-300 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <div className="mx-auto w-24 h-24 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <CheckCircle2 size={48} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Devis Validé</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                        Votre accord a été enregistré avec succès. Ce document tient lieu de commande ferme pour votre action de formation.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
                        <Button asChild variant="outline" className="h-14 px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                            <Link href="/profile">Retour à mon espace</Link>
                        </Button>

                        {inscription.devisUrl && (
                            <Button
                                asChild
                                className="h-14 px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:-translate-y-1 transition-all"
                            >
                                <a
                                    href={inscription.devisUrl.replace('#toolbar=0', '')}
                                    download={`Devis_Formation_${inscription.id}.pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Télécharger une copie (PDF)
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}