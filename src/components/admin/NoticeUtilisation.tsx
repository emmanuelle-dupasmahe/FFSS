"use client";

import React, { useState } from 'react';
import {
    HelpCircle,
    Clock,
    FileText,
    Receipt,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    Edit3,
    BookOpen,
    Megaphone,
    Mail,
    Users,
    Settings,
    Send
} from "lucide-react";

export default function NoticeUtilisation() {
    const [openSection, setOpenSection] = useState<number | null>(1);

    const toggleSection = (id: number) => {
        setOpenSection(openSection === id ? null : id);
    };

    const guideSteps = [
        {
            id: 1,
            title: "DPS : RIS, DEVIS ET CONVENTION",
            icon: <Clock className="text-blue-500" size={16} />,
            content: (
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <p>Pour garantir la cohérence des données dans l'application, les actions doivent être effectuées dans l'ordre chronologique suivant :</p>
                    <ol className="list-decimal ml-5 space-y-1 font-medium">
                        <li><span className="text-blue-500 font-bold">Étape 1 : Le RIS</span> — Ajustez et validez la grille d'évaluation des risques pour fixer l'effectif de secouristes requis.</li>
                        <li><span className="text-blue-500 font-bold">Étape 2 : Le Devis</span> — Ouvrez le chiffrage pour valider les options logistiques (heures, kilomètres, tentes). Le prix calculé est alors figé et enregistré.</li>
                        <li><span className="text-blue-500 font-bold">Étape 3 : La Convention</span> — Générez la convention juridique. Elle ira lire automatiquement les effectifs consolidés à l'étape précédente.</li>
                    </ol>
                </div>
            )
        },
        {
            id: 2,
            title: "LE MODE ÉDITION : TOUT EST MODIFIABLE",
            icon: <Edit3 className="text-emerald-500" size={16} />,
            content: (
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <p>Les grilles de tarifs et les textes administratifs ne sont pas figés. Vous disposez d'une flexibilité totale directement à l'écran :</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><strong className="text-slate-900 dark:text-white">Sur les Devis :</strong> Cliquez directement dans les cases des tableaux pour modifier manuellement une désignation, ajuster un Prix Unitaire (P.U) ou appliquer un pourcentage de remise. Le calcul du net à payer s'actualise instantanément.</li>
                        <li><strong className="text-slate-900 dark:text-white">Sur les Conventions :</strong> Cliquez sur n'importe quel paragraphe textuel pour le réécrire ou corriger une clause selon les négociations avec le client avant de générer le PDF.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 3,
            title: "FACTURATION AUTOMATISÉE",
            icon: <Receipt className="text-purple-500" size={16} />,
            content: (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Inutile de ressaisir les montants après l'événement. Le module de facturation récupère automatiquement le <span className="font-bold text-purple-500">Total Montant exact</span> validé sur le devis (incluant les éventuelles remises accordées). Vous pouvez ajouter de nouvelles lignes de prestations de dernière minute si nécessaire avant l'envoi officiel.
                </p>
            )
        },
        {
            id: 4,
            title: "GESTION DES FORMATIONS, SESSIONS ET EXAMENS",
            icon: <BookOpen className="text-cyan-500" size={16} />,
            content: (
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <p>L'offre de formation et son calendrier sont totalement administrables depuis l'onglet <strong className="text-slate-900 dark:text-white">Gestion des Formations</strong> :</p>
                    <ul className="list-disc ml-5 space-y-1.5">
                        <li><strong className="text-slate-900 dark:text-white">Informations & Tarifs :</strong> Modifiez à tout moment les descriptifs, prérequis et âges minimums. Si le champ tarif reste vide ou est égal à 0, la carte affiche automatiquement la mention <span className="font-bold text-cyan-500">"Sur devis"</span> côté public.</li>
                        <li><strong className="text-slate-900 dark:text-white">Ressources & PDF :</strong> <span className="font-bold text-cyan-500">Joignez des documents téléchargeables</span> (fiches programmes, livrets d'accueil) ou des liens web utiles rattachés à chaque cursus.</li>
                        <li><strong className="text-slate-900 dark:text-white">Planification des Sessions :</strong> Planifiez les dates via l'accordéon dédié. Pour les événements sur une seule journée, renseignez uniquement la date de début : la date de fin est optionnelle et l'affichage public s'adapte automatiquement en affichant <span className="font-semibold text-slate-800 dark:text-slate-200">"Le [Date]"</span> au lieu de "Du... au...".</li>
                        <li><strong className="text-slate-900 dark:text-white">Badges d'Examens (ex: BNSSA) :</strong> Inscrivez le mot clé <span className="font-bold text-red-500">"Examen"</span> dans le champ "Précisions" d'une session pour déclencher automatiquement l'affichage d'un badge rouge distinctif sur le site public.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 5,
            title: "BANDEAU D'ANNONCE ET CARROUSELS",
            icon: <Megaphone className="text-red-500" size={16} />,
            content: (
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <p>La vitrine de l'association est dynamique. Dans la section <strong className="text-slate-900 dark:text-white">Communication & Paramètres</strong> :</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li><span className="font-bold text-red-500">Bandeau d'alerte :</span> Activez-le en un clic pour diffuser une information urgente en haut du site.</li>
                        <li><span className="font-bold text-red-500">Carrousels & Slogans :</span> Modifiez les images défilantes et les textes des pages des DPS et des formations.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 6,
            title: "AUTOMATISATION : MAILS PRÉDÉFINIS",
            icon: <Mail className="text-amber-500" size={16} />,
            content: (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Gagnez du temps sur l'administratif ! L'onglet <strong className="text-slate-900 dark:text-white">Mails Prédéfinis</strong> vous permet de configurer les modèles de textes qui seront utilisés par défaut lors de l'envoi des devis, conventions et factures. Ces textes peuvent toujours être ajustés au cas par cas juste avant l'envoi final à l'organisateur.
                </p>
            )
        },
        {
            id: 7,
            title: "PARAMÈTRES DE BASE (EN-TÊTE ET PIED DE PAGE)",
            icon: <Settings className="text-slate-500" size={16} />,
            content: (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    L'architecture globale du site (le Menu Header et le Footer) est gérée depuis <strong className="text-slate-900 dark:text-white">Paramètres du site</strong>. Si l'association change de numéro de téléphone, d'adresse, de lien vers les réseaux sociaux, ou souhaite modifier l'intitulé d'une catégorie du menu, tout se fait ici, sans avoir besoin de modifier le code source.
                </p>
            )
        },
        {
            id: 8,
            title: "GESTION DES MEMBRES ET DES RÔLES",
            icon: <Users className="text-indigo-500" size={16} />,
            content: (
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <p>Le contrôle et la sécurité des accès aux modules se gèrent depuis l'onglet <strong className="text-slate-900 dark:text-white">Membres</strong> :</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>Vous accédez à la liste complète des profils utilisateurs inscrits sur la plateforme.</li>
                        <li>Vous pouvez <span className="font-bold text-indigo-500">attribuer ou modifier instantanément les rôles</span> de chaque membre (ex: Administrateur, Organisateur de DPS, Secouriste/Stagiaire) pour leur accorder ou restreindre les droits d'accès aux différents pôles.</li>
                    </ul>
                </div>
            )
        },
        {
            id: 9,
            title: "GESTION DES SIGNATURES ET CACHETS",
            icon: <ShieldCheck className="text-emerald-500" size={16} />,
            content: (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Le cachet officiel de l'ASSTSF et la signature du Président Sauveur AMICO sont pré-intégrés de manière sécurisée. Sur les modules de devis, de formation ou de convention, l'application les insère automatiquement lors de la génération du rendu PDF officiel.
                </p>
            )
        },
        {
            id: 10,
            title: "MAILING CIBLÉ (ENVOI GROUPÉ)",
            icon: <Send className="text-blue-500" size={16} />,
            content: (
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <p>L'onglet <strong className="text-slate-900 dark:text-white">Mailing</strong> vous permet de communiquer facilement avec vos stagiaires :</p>
                    <ul className="list-disc ml-5 space-y-1.5">
                        <li><strong className="text-slate-900 dark:text-white">Ciblage intelligent :</strong> Sélectionnez une formation pour envoyer un e-mail groupé. L'application filtre automatiquement et n'envoie le message <span className="font-bold text-blue-500">qu'aux stagiaires dont le dossier administratif est "VALIDÉ"</span>.</li>
                        <li><strong className="text-slate-900 dark:text-white">Mise en forme :</strong> Rédigez votre message naturellement. Les sauts de ligne que vous tapez dans le formulaire sont conservés et s'afficheront correctement dans l'e-mail reçu.</li>
                        <li><strong className="text-slate-900 dark:text-white">Sécurité :</strong> Une fenêtre de confirmation récapitulative s'affiche systématiquement avant l'expédition pour vous éviter tout envoi accidentel.</li>
                    </ul>
                </div>
            )
        }
    ];

    return (
        <div className="w-full space-y-4">
            {/* 🪛 EN-TÊTE AFFINÉ : "font-light" et "tracking-widest" au lieu de "font-black" */}
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <HelpCircle className="text-blue-500 opacity-80" size={24} />
                <div>
                    <h2 className="text-sm font-light uppercase tracking-widest text-foreground">Notice d'utilisation Admin</h2>
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em] mt-1">Aide à la prise en main globale de l'application</p>
                </div>
            </div>

            <div className="space-y-2">
                {guideSteps.map((step) => (
                    <div
                        key={step.id}
                        className="bg-card rounded-2xl border border-border overflow-hidden transition-all shadow-sm shadow-black/5 hover:border-primary/20"
                    >
                        {/* 🪛 BOUTONS AFFINÉS : "font-light" au lieu de "font-bold", et on utilise text-foreground */}
                        <button
                            onClick={() => toggleSection(step.id)}
                            className="w-full flex items-center justify-between p-4 text-left font-light text-xs text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus:outline-none"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl opacity-80">
                                    {step.icon}
                                </div>
                                <span className="uppercase tracking-[0.15em]">{step.title}</span>
                            </div>
                            {openSection === step.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </button>

                        {openSection === step.id && (
                            <div className="p-5 bg-slate-50/50 dark:bg-transparent border-t border-border text-[11px] md:text-xs animate-in fade-in duration-200">
                                {step.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}