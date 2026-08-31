"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Printer, Users, Activity, Eye, Edit3, Signature, CalendarDays } from "lucide-react";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { updateTypeConvention, updateDevisContactInfo, updateDevisEventInfo } from "@/app/actions/devis";

export default function ConventionGenerator({ demandeDPS, calculRIS }: { demandeDPS: any, calculRIS: any }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const [typeConvention, setTypeConvention] = useState<'PUBLIC' | 'ACTEUR'>(demandeDPS.typeConvention || 'PUBLIC');
    const [isUpdatingType, setIsUpdatingType] = useState(false);

    const [inclureSignature, setInclureSignature] = useState(true);

    // Formatage des dates au format YYYY-MM-DD pour que les <input type="date"> fonctionnent
    const defaultDateDebInput = demandeDPS.eventDate ? new Date(demandeDPS.eventDate).toISOString().split('T')[0] : "";
    const defaultDateFinInput = demandeDPS.endDate ? new Date(demandeDPS.endDate).toISOString().split('T')[0] : "";

    const [infos, setInfos] = useState({
        organisme: demandeDPS.organismeDemandeur || "",
        contactNom: demandeDPS.nomContact || demandeDPS.user?.name || "",
        contactTel: demandeDPS.telephoneContact || "",
        contactEmail: demandeDPS.emailContact || demandeDPS.user?.email || "",

        eventNom: demandeDPS.eventTitle || demandeDPS.title || "",
        eventLieu: demandeDPS.location || "",
        dateDebutInput: defaultDateDebInput,
        dateFinInput: defaultDateFinInput,
        heureDebut: demandeDPS.startTime || "",
        heureFin: demandeDPS.endTime || "",

        texteArt42: `- Nombre d'intervenants secouristes : ${calculRIS?.nombreSecouristes || 0}\n- Véhicules de premiers secours : ${calculRIS?.nombreVehicules || 0} VPSP\n- Autres véhicules : 0`,

        assoPresTel: "06.11.58.34.35",
        assoVpTel: "06.99.70.91.63",
        assoTresTel: "06.89.85.34.07",
        assoSecTel: "06.75.69.31.12",
        assoEmail: "asst.laseyne@gmail.com",

        texteIntro: "Monsieur, Madame, suite à votre demande de mise en place d'un Dispositif Prévisionnel de Secours à personnes (D.P.S), vous trouverez ci-joint deux exemplaires de la convention précisant les modalités de notre accord. Vous voudrez bien les relire et nous retourner un exemplaire signé. Dans l'attente, veuillez, Madame, Monsieur, accepter nos salutations les meilleures.",
        texteArt1: `L'Association des Secouristes de la Seyne Tamaris Six-Fours, Adresse: 98 rue Fontaine, Square Émile Malsert, 83500 La Seyne-sur-Mer. Courriel: asst.laseyne@gmail.com. Ci-après désignée: association prestataire représentée par son président Sauveur AMICO: association ayant reçu notamment une autorisation d'exercice déconcentrée pour les missions de sécurité civile de type D par sa régulière affiliation à la Fédération Française de Sauvetage et de Secourisme (FFSS), association agréée de sécurité civile au plan national par arrêté ministériel.`,
        texteArt31: "La présente convention a pour but de fixer les modalités de fonctionnement entre: L'Association des Secouristes de la Seyne Tamaris Six-Fours, qui peut régulièrement exercer, d'une manière déconcentrée les missions de sécurité civile pour la mise en place d'un Dispositif Prévisionnel de Secours à personnes, ceci afin de bien clarifier le cadre juridique de la prestation de service assurée.",
        texteArt33: "Cet événement a fait l’objet d’une évaluation des risques dont la grille est jointe à la présente convention.",
        texteArt34: "L'organisateur reconnaît posséder toutes les autorisations nécessaires au déroulement de ladite manifestation et avoir souscrit une assurance responsabilité civile organisateur.",
        texteArt35: "Conformément aux textes réglementaires, l'organisateur est responsable de l'ensemble de l'organisation et des mesures prises en liaison avec l'autorité de police compétente (maire, préfet). La mise en place d'un dispositif de secours ne peut avoir pour conséquence un transfert de responsabilité vers l'association prestataire.",
        texteArt41: `Pour répondre à la demande formulée par M./Mme ${demandeDPS.nomContact || demandeDPS.user?.name || ""} et au vu du résultat de la grille d'évaluation des risques renseignée, l'Association des Secouristes de la Seyne Tamaris Six-Fours, conformément aux directives du Référentiel National relatif aux Dispositifs Prévisionnels de Secours (RNDPS) - Ministère de l'intérieur arrêté NOR: INTE0600910A du 7 novembre 2006, s'engage à mettre en place le Dispositif Prévisionnel de Secours suivant :`,
        texteArt431: "Les équipiers secouristes sont titulaires du diplôme de Premiers Secours en Équipe de niveau 2 (PSE2) et les secouristes de niveau 1 (PSE1), validés dans leur aptitude opérationnelle conformément à la réglementation. Un membre de chaque équipe exerce les fonctions de chef d'équipe.",
        texteArt432: "Les différents lots de matériels mis à disposition sont conformes au RNDPS du 7 novembre 2006.",
        texteArt44: "1° Reconnaître et analyser la situation accidentelle.\n2° Prendre les premières mesures adaptées de sécurité.\n3° Faire un bilan et porter les premiers secours nécessaires à une victime.\n4° Prodiguer des conseils adaptés.\n5° Contribuer à la mise en place de la chaîne des secours (alerte / pouvoirs publics).\n6° Accueillir les secours et faciliter leur intervention.",
        texteArt45: "L'association prestataire n'assurera pas le transport des victimes vers un centre hospitalier. Les éventuelles évacuations des blessés ou malades sont assurées par les services publics de secours.",
        texteArt46: "Les intervenants sont revêtus de leur tenue officielle. Le chef de poste prendra contact avec l’organisateur ou son représentant dès son arrivée sur site pour vérifier la concordance avec les clauses techniques de la convention.",
        texteArt51: "- 1 tente ou local à disposition des secouristes.\n- Un moyen d'appel des secours publics en cas de non couverture des mobiles.",
        texteRepas: "Les repas et les boissons des secouristes bénévoles présents seront pris en charge par l'organisateur.",
        texteArt53: "L’intervention des secouristes demeure bénévole (but non lucratif). Toutefois, l'organisateur dédommage l'association des frais engendrés, pour un montant défini dans le devis estimatif remis conjointement par l’association. La facture définitive sera réglée, à réception, par virement ou par chèque libellé à l’ordre de l’association.",
        texteArt9: "En cas de litige, le contentieux pourra faire l'objet de recours devant les tribunaux compétents. Les informations recueillies font l'objet d'un traitement destiné à l'établissement de documents réglementaires. La durée de conservation des données est de 20 ans après la fin de l'événement (code de la santé publique : article R1112-7).",
    });

    const [isSavingInfos, setIsSavingInfos] = useState(false);
    const [isSavingEvent, setIsSavingEvent] = useState(false);

    const handleSaveInfos = async () => {
        setIsSavingInfos(true);
        const result = await updateDevisContactInfo(demandeDPS.id, {
            organisme: infos.organisme,
            contactNom: infos.contactNom,
            contactTel: infos.contactTel,
            contactEmail: infos.contactEmail
        });

        if (result.success) {
            toast.success("Coordonnées mises à jour avec succès !");
        } else {
            toast.error("Erreur lors de la sauvegarde.");
        }
        setIsSavingInfos(false);
    };

    const handleSaveEvent = async () => {
        setIsSavingEvent(true);
        const result = await updateDevisEventInfo(demandeDPS.id, {
            eventNom: infos.eventNom,
            eventLieu: infos.eventLieu,
            dateDebut: new Date(infos.dateDebutInput),
            dateFin: infos.dateFinInput ? new Date(infos.dateFinInput) : null,
            heureDebut: infos.heureDebut,
            heureFin: infos.heureFin
        });

        if (result.success) {
            toast.success("Informations de l'événement mises à jour !");
        } else {
            toast.error("Erreur lors de la sauvegarde de l'événement.");
        }
        setIsSavingEvent(false);
    };

    const handleTypeChange = async (type: 'PUBLIC' | 'ACTEUR') => {
        if (type === typeConvention) return;

        setTypeConvention(type);
        setIsUpdatingType(true);

        const result = await updateTypeConvention(demandeDPS.id, type);

        if (result.success) {
            toast.success(`Convention basculée en mode ${type === 'PUBLIC' ? 'Public' : 'Acteurs'}`);
        } else {
            toast.error("Erreur lors de la sauvegarde du type.");
        }
        setIsUpdatingType(false);
    };

    const handleGeneratePDF = async () => {
        setIsGenerating(true);
        toast.loading("Création du document officiel (3 pages)...", { id: "conv-pdf" });

        try {
            const element = document.getElementById("zone-pdf-convention");
            if (!element) throw new Error("Zone PDF introuvable");

            element.classList.remove("hidden");
            element.classList.add("flex");
            element.style.position = "absolute";
            element.style.top = "0";
            element.style.left = "0";
            element.style.zIndex = "-9999";

            const textareas = element.querySelectorAll("textarea");
            textareas.forEach(ta => {
                ta.style.height = "0px";
                ta.style.height = (ta.scrollHeight + 5) + "px";
            });

            const pages = element.querySelectorAll('.pdf-page');
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

            for (let i = 0; i < pages.length; i++) {
                const pageEl = pages[i] as HTMLElement;
                const imgData = await htmlToImage.toJpeg(pageEl, {
                    quality: 0.95,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                    skipFonts: true
                });

                if (i > 0) pdf.addPage();

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgProps = pdf.getImageProperties(imgData);

                let printWidth = pdfWidth;
                let printHeight = (imgProps.height * pdfWidth) / imgProps.width;

                if (printHeight > pdfHeight) {
                    printHeight = pdfHeight;
                    printWidth = (imgProps.width * pdfHeight) / imgProps.height;
                }

                const xOffset = (pdfWidth - printWidth) / 2;
                pdf.addImage(imgData, 'JPEG', xOffset, 0, printWidth, printHeight);
            }

            element.style.position = "";
            element.style.top = "";
            element.style.left = "";
            element.style.zIndex = "";
            element.classList.remove("flex");
            element.classList.add("hidden");

            pdf.save(`Convention_${typeConvention}_${infos.organisme || 'ASSTSF'}.pdf`);
            toast.success("Convention téléchargée avec succès !", { id: "conv-pdf" });
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la génération technique.", { id: "conv-pdf" });
        } finally {
            setIsGenerating(false);
        }
    };

    const inlineTextareaStyle = "w-full bg-transparent resize-none focus:outline-none text-justify font-sans text-[12px] leading-relaxed p-1 rounded hover:bg-slate-50 focus:bg-blue-50/50 transition-colors border border-transparent focus:border-blue-300 text-slate-900";

    const formatDate = (isoString: string) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString('fr-FR');
    };

    const page1 = (
        <>
            <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-black">
                <div className="flex items-center gap-4">
                    <img src="/log_asstsf.png" alt="ASSTSF Logo" className="w-16 h-16 object-contain" />
                    <div>
                        <h2 className="text-lg font-black uppercase leading-tight text-black">ASSOCIATION DES SECOURISTES</h2>
                        <h3 className="font-bold text-sm uppercase text-black">La Seyne-Tamaris-Six-Fours</h3>
                        <p className="text-[10px] mt-1 text-gray-700">98 rue Fontaine, Square Émile Malsert, 83500 La Seyne-sur-Mer</p>
                        <p className="text-[10px] text-gray-700">Identifiant Siret: 401715 107 00033 | R.N.A: W832006454</p>
                    </div>
                </div>
                <div className="text-right text-[9px] font-medium leading-tight text-gray-700">
                    <p>Président : {infos.assoPresTel}</p>
                    <p>Vice-Président : {infos.assoVpTel}</p>
                    <p>Trésorier : {infos.assoTresTel}</p>
                    <p>Secrétaire : {infos.assoSecTel}</p>
                    <p className="mt-1 font-bold text-black">{infos.assoEmail}</p>
                </div>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-2xl font-black uppercase border-y-2 border-black py-2 inline-block px-10 tracking-widest text-black">CONVENTION</h1>
            </div>

            <textarea rows={4} value={infos.texteIntro} onChange={e => setInfos({ ...infos, texteIntro: e.target.value })} className={inlineTextareaStyle + " mb-6 indent-8"} />

            <h3 className="font-bold uppercase text-[13px] bg-gray-100 text-black p-1 mb-2">1. Association Prestataire :</h3>
            <textarea rows={5} value={infos.texteArt1} onChange={e => setInfos({ ...infos, texteArt1: e.target.value })} className={inlineTextareaStyle + " mb-4"} />

            <h3 className="font-bold uppercase text-[13px] bg-gray-100 text-black p-1 mb-2">2. Organisateur de l'événement :</h3>
            <p className="mb-4 text-[12px] text-slate-900 leading-relaxed px-1">
                Raison sociale de l'organisateur : <strong>{infos.organisme}</strong><br />
                Représenté par : <strong>{infos.contactNom}</strong><br />
                Téléphone : {infos.contactTel}<br />
                Adresse mail : {infos.contactEmail}
            </p>

            <h3 className="font-bold uppercase text-[13px] bg-gray-100 text-black p-1 mb-2">3. Objet de la convention :</h3>
            <p className="font-bold underline text-[11px] mb-1 text-black">3.1 Objet</p>
            <textarea rows={3} value={infos.texteArt31} onChange={e => setInfos({ ...infos, texteArt31: e.target.value })} className={inlineTextareaStyle + " mb-2"} />

            {typeConvention === 'PUBLIC' ? (
                <p className="mb-4 font-bold bg-yellow-50 p-2 border border-yellow-200 text-black text-[12px]">La mise en place du Dispositif Prévisionnel de Secours concerne le public (spectateur) de la manifestation.</p>
            ) : (
                <div className="mb-4 font-bold bg-yellow-50 p-2 border border-yellow-200 text-black text-[12px] space-y-2 text-justify">
                    <p>La mise en place du Dispositif Prévisionnel de Secours concerne les acteurs de la manifestation (joueurs, compétiteurs, comédiens, ...).</p>
                    <p>Bien que les dispositions du Référentiel National Dispositifs prévisionnels de Secours soient uniquement prises pour assurer la sécurité du public, il convient à l’organisateur de la manifestation d’apprécier l’opportunité de les appliquer à la sécurité des acteurs, en l’absence de dispositions réglementaires plus contraignantes. En outre, l’organisateur est libre de faire appel, en complément du DPS à personnes prescrit, à tout autre moyen humain ou matériel, destiné à augmenter le niveau de sécurité de la manifestation.</p>
                </div>
            )}

            <p className="font-bold underline text-[11px] mb-1 text-black">3.2 Descriptif de l'événement :</p>
            <ul className="mb-4 list-disc ml-6 text-[12px] text-slate-900">
                <li>Nom de l'événement : <strong>{infos.eventNom}</strong></li>
                <li>Date et heures : Du {formatDate(infos.dateDebutInput)} ({infos.heureDebut}) au {formatDate(infos.dateFinInput)} ({infos.heureFin})</li>
                <li>Adresse Précise : <strong>{infos.eventLieu}</strong></li>
            </ul>

            <p className="font-bold underline text-[11px] mb-1 text-black">3.3 Grille d'évaluation des risques :</p>
            <textarea rows={2} value={infos.texteArt33} onChange={e => setInfos({ ...infos, texteArt33: e.target.value })} className={inlineTextareaStyle + " mb-2"} />

            <p className="font-bold underline text-[11px] mb-1 text-black">3.4 Autorisations :</p>
            <textarea rows={2} value={infos.texteArt34} onChange={e => setInfos({ ...infos, texteArt34: e.target.value })} className={inlineTextareaStyle + " mb-2"} />

            <p className="font-bold underline text-[11px] mb-1 text-black">3.5 Responsabilités :</p>
            <textarea rows={3} value={infos.texteArt35} onChange={e => setInfos({ ...infos, texteArt35: e.target.value })} className={inlineTextareaStyle + " mb-2"} />
        </>
    );

    const page2 = (
        <>
            <h3 className="font-bold uppercase text-[13px] bg-gray-100 text-black p-1 mb-2">4. Prestations fournies par le prestataire :</h3>
            <p className="font-bold underline text-[11px] mb-1 text-black">4.1 Type du dispositif mis en place :</p>
            <textarea rows={4} value={infos.texteArt41} onChange={e => setInfos({ ...infos, texteArt41: e.target.value })} className={inlineTextareaStyle + " mb-4"} />

            <p className="font-bold underline text-[11px] mb-1 text-black">4.2 Composition du dispositif :</p>
            <textarea rows={3} value={infos.texteArt42} onChange={e => setInfos({ ...infos, texteArt42: e.target.value })} className={inlineTextareaStyle + " mb-4"} />

            <p className="font-bold underline text-[11px] mb-1 text-black">4.3 Informations concernant le dispositif :</p>
            <p className="mb-1 italic text-black font-semibold">4.3.1 Les intervenants :</p>
            <textarea rows={3} value={infos.texteArt431} onChange={e => setInfos({ ...infos, texteArt431: e.target.value })} className={inlineTextareaStyle + " mb-2"} />
            <p className="mb-1 italic text-black font-semibold">4.3.2 Moyens matériels :</p>
            <textarea rows={1} value={infos.texteArt432} onChange={e => setInfos({ ...infos, texteArt432: e.target.value })} className={inlineTextareaStyle + " mb-4"} />

            <p className="font-bold underline text-[11px] mb-1 text-black">4.4 Missions :</p>
            <textarea rows={7} value={infos.texteArt44} onChange={e => setInfos({ ...infos, texteArt44: e.target.value })} className={inlineTextareaStyle + " mb-4 font-mono text-[11px] bg-slate-50/50"} />

            <p className="font-bold underline text-[11px] mb-1 text-black">4.5 Transport des victimes :</p>
            <textarea rows={2} value={infos.texteArt45} onChange={e => setInfos({ ...infos, texteArt45: e.target.value })} className={inlineTextareaStyle + " mb-4"} />

            <p className="font-bold underline text-[11px] mb-1 text-black">4.6 Modalités opérationnelles :</p>
            <textarea rows={3} value={infos.texteArt46} onChange={e => setInfos({ ...infos, texteArt46: e.target.value })} className={inlineTextareaStyle + " mb-2"} />
        </>
    );

    const page3 = (
        <>
            <h3 className="font-bold uppercase text-[13px] bg-gray-100 text-black p-1 mb-2">5. Engagements de l'organisateur :</h3>
            <p className="mb-1 font-bold text-[11px] underline text-black">5.1 Aspects logistiques :</p>
            <textarea rows={2} value={infos.texteArt51} onChange={e => setInfos({ ...infos, texteArt51: e.target.value })} className={inlineTextareaStyle + " mb-2 font-mono text-[11px]"} />

            <p className="mb-1 text-emerald-700 font-bold text-[11px] px-1">Prise en charge restauration / boissons :</p>
            <textarea rows={2} value={infos.texteRepas} onChange={e => setInfos({ ...infos, texteRepas: e.target.value })} className={inlineTextareaStyle + " mb-2 border-l-2 border-emerald-500 pl-2 font-medium bg-emerald-50/20 text-emerald-950"} />

            <p className="mb-2 text-[12px] text-slate-900"><strong>5.2 Modalités opérationnelles :</strong> Correspondant de l’organisateur : M./Mme {infos.contactNom} Tél : {infos.contactTel}. Le commandement du dispositif sera assuré par l'association prestataire.</p>

            <p className="font-bold underline text-[11px] mb-1 text-black">5.3 Modalités financières :</p>
            <textarea rows={3} value={infos.texteArt53} onChange={e => setInfos({ ...infos, texteArt53: e.target.value })} className={inlineTextareaStyle + " mb-6"} />

            <h3 className="font-bold uppercase text-[13px] bg-gray-100 text-black p-1 mb-2">9. Litiges :</h3>
            <textarea rows={3} value={infos.texteArt9} onChange={e => setInfos({ ...infos, texteArt9: e.target.value })} className={inlineTextareaStyle + " mb-6"} />

            <div className="mt-8 mb-6 font-bold text-[12px] text-black">Convention établie en double exemplaires à La Seyne Sur Mer, le {new Date().toLocaleDateString('fr-FR')}</div>

            <div className="grid grid-cols-2 gap-12 mt-4 pt-4 border-t-2 border-black text-black">
                <div>
                    <p className="font-bold text-[12px] underline mb-2">Pour l'organisateur :</p>

                    {demandeDPS.isSigned && demandeDPS.signatureImg ? (
                        <div className="mt-2 text-left">
                            <img src={demandeDPS.signatureImg} alt="Signature Client" className="h-16 object-contain mix-blend-multiply" />
                            <p className="text-[8px] font-bold text-emerald-600 mt-1">
                                Signé numériquement le {demandeDPS.signedAt ? new Date(demandeDPS.signedAt).toLocaleDateString('fr-FR') : ''}
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-[10px] text-gray-500 italic mb-12">Lu et approuvé (date et signature)</p>
                            <p className="text-[10px] text-gray-500 italic">(cachet, nom et prénom, fonction du signataire)</p>
                        </>
                    )}
                </div>
                <div className="relative">
                    <p className="font-bold text-[12px] underline mb-2">Pour l'Association :</p>
                    <p className="text-[10px] text-gray-900 font-bold mb-1">Sauveur AMICO, Président de l'ASSTSF</p>

                    {inclureSignature && (
                        <div className="relative h-24 mt-2">
                            <img src="/cachet-asso.png" alt="Cachet ASSTSF" className="absolute top-0 left-0 w-48 h-48 object-contain opacity-80" />
                            <img src="/pres.png" alt="Signature Président" className="absolute top-4 left-12 w-32 h-16 object-contain mix-blend-multiply" />
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 relative lg:sticky top-8 overflow-y-auto max-h-[calc(100vh-4rem)] z-10">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                    <FileText className="text-blue-600" size={24} />
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider dark:text-white">Édition Juridique</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Sélection & Correction</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-[#001A3D] rounded-xl border border-slate-200 dark:border-white/10">
                    <Checkbox id="sign" checked={inclureSignature} onCheckedChange={(v: boolean) => setInclureSignature(v)} />
                    <Label htmlFor="sign" className="flex items-center gap-2 cursor-pointer font-bold uppercase text-[10px] dark:text-white">
                        <Signature size={14} /> Apposer signature et cachet
                    </Label>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400">Cible de la convention</p>
                    <div className="flex gap-2">
                        <Button
                            variant={typeConvention === 'PUBLIC' ? 'default' : 'outline'}
                            onClick={() => handleTypeChange('PUBLIC')}
                            disabled={isUpdatingType}
                            className="flex-1 rounded-xl text-[10px] font-black uppercase h-10"
                        >
                            <Users className="mr-2" size={14} /> Public
                        </Button>
                        <Button
                            variant={typeConvention === 'ACTEUR' ? 'default' : 'outline'}
                            onClick={() => handleTypeChange('ACTEUR')}
                            disabled={isUpdatingType}
                            className="flex-1 rounded-xl text-[10px] font-black uppercase h-10"
                        >
                            <Activity className="mr-2" size={14} /> Acteurs
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 border-t border-slate-200 dark:border-white/10 pt-4">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Edit3 size={16} />
                        <p className="text-[10px] font-black uppercase">Variables de Contact</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Organisme</Label>
                            <Input value={infos.organisme} onChange={e => setInfos({ ...infos, organisme: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Nom du contact</Label>
                            <Input value={infos.contactNom} onChange={e => setInfos({ ...infos, contactNom: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Téléphone Client</Label>
                            <Input value={infos.contactTel} onChange={e => setInfos({ ...infos, contactTel: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Adresse Email Client</Label>
                            <Input value={infos.contactEmail} onChange={e => setInfos({ ...infos, contactEmail: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleSaveInfos}
                        disabled={isSavingInfos}
                        className="w-full mt-4 h-8 text-[10px] uppercase font-bold bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                        {isSavingInfos ? "Sauvegarde..." : "Enregistrer les contacts"}
                    </Button>
                </div>

                {/* 🪛 NOUVEAU BLOC : DÉTAILS DE L'ÉVÉNEMENT */}
                <div className="space-y-4 border-t border-slate-200 dark:border-white/10 pt-4">
                    <div className="flex items-center gap-2 text-blue-600">
                        <CalendarDays size={16} />
                        <p className="text-[10px] font-black uppercase">Détails de l'Événement</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Nom de l'événement</Label>
                            <Input value={infos.eventNom} onChange={e => setInfos({ ...infos, eventNom: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Adresse (Lieu)</Label>
                            <Input value={infos.eventLieu} onChange={e => setInfos({ ...infos, eventLieu: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Date Début</Label>
                            <Input type="date" value={infos.dateDebutInput} onChange={e => setInfos({ ...infos, dateDebutInput: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Heure Début</Label>
                            <Input type="time" value={infos.heureDebut} onChange={e => setInfos({ ...infos, heureDebut: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Date Fin</Label>
                            <Input type="date" value={infos.dateFinInput} onChange={e => setInfos({ ...infos, dateFinInput: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-slate-500">Heure Fin</Label>
                            <Input type="time" value={infos.heureFin} onChange={e => setInfos({ ...infos, heureFin: e.target.value })} className="h-8 text-xs bg-slate-50 dark:bg-[#001A3D]" />
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleSaveEvent}
                        disabled={isSavingEvent}
                        className="w-full mt-4 h-8 text-[10px] uppercase font-bold bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                        {isSavingEvent ? "Sauvegarde..." : "Enregistrer les dates"}
                    </Button>
                </div>

                <Button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-blue-600/10 transition-all hover:-translate-y-0.5 mt-6"
                >
                    <Printer className="mr-2" size={16} />
                    {isGenerating ? "Création du PDF..." : "Générer la Convention PDF"}
                </Button>
            </div>

            <div className="lg:col-span-2 space-y-4 min-w-0 w-full mt-8 lg:mt-0">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase pl-2">
                    <Eye size={12} /> Mode Document Vivant : Cliquez sur un paragraphe pour le modifier
                </div>

                <div className="bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] p-4 md:p-8 shadow-inner border border-slate-200 overflow-y-auto max-h-[800px] flex flex-col gap-6">
                    <div className="bg-white text-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 font-sans text-[12px] space-y-2 relative">
                        <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-md">Page 1</div>
                        {page1}
                    </div>
                    <div className="bg-white text-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 font-sans text-[12px] space-y-2 relative">
                        <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-md">Page 2</div>
                        {page2}
                    </div>
                    <div className="bg-white text-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 font-sans text-[12px] space-y-2 relative">
                        <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-md">Page 3</div>
                        {page3}
                    </div>
                </div>
            </div>

            <div id="zone-pdf-convention" className="hidden flex-col gap-10 bg-gray-200">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    #zone-pdf-convention textarea {
                        overflow: hidden !important;
                        white-space: pre-wrap !important;
                        border: none !important;
                        background: transparent !important;
                        resize: none !important;
                    }
                `}} />
                <div className="pdf-page bg-white text-black text-[12px] leading-snug font-sans p-[15mm] w-[210mm] min-h-[297mm] box-border relative">
                    {page1}
                </div>
                <div className="pdf-page bg-white text-black text-[12px] leading-snug font-sans p-[15mm] w-[210mm] min-h-[297mm] box-border relative">
                    {page2}
                </div>
                <div className="pdf-page bg-white text-black text-[12px] leading-snug font-sans p-[15mm] w-[210mm] min-h-[297mm] box-border relative">
                    {page3}
                </div>
            </div>
        </div>
    );
}