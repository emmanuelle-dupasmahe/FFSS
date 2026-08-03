import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileSignature, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignatureClient from "./SignatureClient";
import DownloadPdfButton from "./DownloadPdfButton";

// --- NOUVEAU : Traducteurs pour afficher les textes longs sur le RIS ---
const getLabelP2 = (val: string | null | undefined) => {
    if (val === "Calme") return "Assis (cérémonie, spectacle …)";
    if (val === "Peu dynamique") return "Debout statique (foire, …)";
    if (val === "Dynamique") return "Debout dynamique (fête foraine, …)";
    if (val === "Très dynamique") return "Debout très Dynamique : Dance, féria, …";
    return val || "Non renseigné";
};

const getLabelE1 = (val: string | null | undefined) => {
    if (val === "Facile") return "Structure permanente, voie publique";
    if (val === "Intermédiaire") return "Structure non permanente, espaces naturel -2ha avec peu de pente";
    if (val === "Difficile") return "Espace naturel -5ha avec de la pente";
    if (val === "Complexe") return "Espace naturel accidenté + de 5ha, progression des secours rendue difficile par le public";
    return val || "Non renseigné";
};

// Ce composant serveur récupère les données de manière sécurisée
export default async function ConventionSignaturePage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session || !session.user?.email) {
        redirect("/login");
    }

    const { id } = await params;

    // Récupération sécurisée : on s'assure que le devis appartient bien à l'utilisateur connecté
    const devis = await prisma.devisDPS.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!devis || devis.user.email !== session.user.email) {
        notFound();
    }

    // --- LOGIQUE DE CALCUL ---
    const p2 = devis.p2 || 0.25;
    const e1 = devis.e1 || 0.25;
    const e2 = devis.e2 || 0.25;
    const p1 = Number(devis.expectedPublic || 0);

    const p_lisse = p1 <= 100000 ? p1 : 100000 + (p1 - 100000) / 2;
    const i = p2 + e1 + e2;
    const ris = i * (p_lisse / 1000);

    let qualification = "";
    if (ris <= 0.25) qualification = "Diligence autorité de police";
    else if (ris <= 1.125) qualification = "PAPS (Point d'alerte et de Premiers Secours)";
    else if (ris <= 12) qualification = "DPS de petite envergure (PE)";
    else if (ris <= 36) qualification = "DPS de moyenne envergure (ME)";
    else qualification = "DPS de grande envergure (GE)";

    // 🚨 RÈGLE D'EXCEPTION : Surclassement en PE si E2 est supérieur ou égal à 0.40
    if (ris <= 1.125 && e2 >= 0.40) {
        qualification = "DPS de petite envergure (PE)";
    }

    // Le calcul de l'effectif se base sur la qualification finale
    let effectif = (qualification === "Diligence autorité de police" || qualification === "PAPS (Point d'alerte)")
        ? 2
        : Math.max(4, Math.ceil(ris / 2) * 2);

    if (ris > 12) effectif = Math.max(12, Math.ceil(ris / 2) * 2);
    if (ris > 36) effectif = Math.max(36, Math.ceil(ris / 2) * 2);


    // =======================================================
    // DOCUMENT 1 : RAPPORT INITIAL DE SÉCURITÉ (RIS)
    // =======================================================
    const contenuRIS = (
        <div id="zone-pdf-ris" className="bg-white text-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-200 overflow-y-auto font-sans text-[12px] space-y-6 leading-relaxed mb-8">
            <div className="flex justify-between items-start mb-6 text-black text-left">
                <div className="flex items-center gap-4">
                    <img src="/log_asstsf.png" alt="ASSTSF Logo" className="w-16 h-16 object-contain" />
                    <div>
                        <h2 className="text-base font-black uppercase leading-tight">ASSOCIATION DES SECOURISTES</h2>
                        <h3 className="font-bold text-xs uppercase text-slate-600">La Seyne-Tamaris-Six-Fours</h3>
                    </div>
                </div>
                <div className="text-right text-[10px] font-bold uppercase text-slate-700">
                    <p>Fiche Technique RIS</p>
                    <p className="text-primary font-mono text-[9px]">Réf : RIS-{devis.id.slice(-6).toUpperCase()}</p>
                </div>
            </div>

            <div className="text-center mb-6">
                <h1 className="text-xl font-black uppercase border-y border-black py-1.5 inline-block px-8 tracking-wider text-black">
                    GRILLE D'ÉVALUATION DES RISQUES
                </h1>

                {/* --- Nom de l'événement et date --- */}
                <div className="mt-4 mb-2">
                    <h2 className="text-lg font-black uppercase text-blue-900">{devis.eventTitle}</h2>
                    <p className="text-xs font-bold text-slate-600 mt-1">
                        Date(s) : {devis.eventDate ? new Date(devis.eventDate).toLocaleDateString('fr-FR') : ""}
                        {devis.endDate ? ` au ${new Date(devis.endDate).toLocaleDateString('fr-FR')}` : ""}
                    </p>
                </div>
                {/* ------------------------------------------- */}

                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Évaluation des Risques & Dimensionnement du Dispositif</p>
            </div>

            {/* Grille d'évaluation technique */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-left">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-wider">Indices de Risque Renseignés</p>

                    {/* --- Intitulés alignés sur le formulaire --- */}
                    <ul className="space-y-1 text-[11px]">
                        <li>• Public attendu : <strong>{devis.expectedPublic || "Non renseigné"} personnes</strong></li>
                        <li>• Type d'activité (P2) : <strong>{getLabelP2(devis.ambiance)}</strong></li>
                        <li>• Environnement (E1) : <strong>{getLabelE1(devis.accessibilite)}</strong></li>
                        <li>• Secours publics (E2) : <strong>{devis.delaiSecours || "Non renseigné"}</strong></li>
                    </ul>
                    {/* ----------------------------------------------------- */}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-left">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-wider">Coefficients Réglementaires</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div className="bg-white p-1 rounded border">
                            <span className="block text-[9px] font-bold text-slate-400">P2 (Public)</span>
                            <strong className="text-slate-900 font-mono">{devis.p2}</strong>
                        </div>
                        <div className="bg-white p-1 rounded border">
                            <span className="block text-[9px] font-bold text-slate-400">E1 (Environnement)</span>
                            <strong className="text-slate-900 font-mono">{devis.e1}</strong>
                        </div>
                        <div className="bg-white p-1 rounded border">
                            <span className="block text-[9px] font-bold text-slate-400">E2 (Délai)</span>
                            <strong className="text-slate-900 font-mono">{devis.e2}</strong>
                        </div>
                    </div>
                    <p className="text-[9px] text-slate-500 italic mt-2">Calculé selon l'arrêté ministériel du 7 novembre 2006 (RNDPS).</p>
                </div>
            </div>

            {/* Configuration Logistique Opérationnelle */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-left mb-6">
                <h4 className="font-black text-[10px] uppercase text-blue-800 tracking-wider mb-3">Dimensionnement opérationnel retenu</h4>

                <div className="flex items-center gap-8 mb-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-blue-600/80 font-bold uppercase">Score RIS *</span>
                        <span className="text-xl font-black text-blue-900">
                            {ris.toFixed(3)}
                        </span>
                        <span className="text-[8px] text-blue-800/70 italic mt-0.5">
                            * Ratio Intervenants Secouristes
                        </span>
                    </div>
                    <div className="w-px h-8 bg-blue-200"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-blue-600/80 font-bold uppercase">Effectif Minimum Requis</span>
                        <span className="text-xl font-black text-blue-900">
                            {effectif} Secouristes
                        </span>
                    </div>
                    <div className="w-px h-8 bg-blue-200"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-blue-600/80 font-bold uppercase">Classification</span>
                        <span className="text-sm font-bold text-blue-900 uppercase">
                            {qualification}
                        </span>
                    </div>
                </div>

                <p className="text-[10px] text-blue-800/70 leading-relaxed border-t border-blue-200/50 pt-2">
                    * Conformément au Référentiel National (RNDPS), le dispositif final (incluant d'éventuels renforts ou véhicules) est détaillé à l'article 4 de la convention ci-dessous.
                </p>
            </div>

            {/* DOUBLE SIGNATURE POUR LE RIS (SANS TAMPON) */}
            <div className="grid grid-cols-2 gap-12 mt-8 pt-4 border-t-2 border-black text-black">
                <div className="text-left">
                    <p className="font-bold text-[12px] underline mb-2">Pour l'organisateur :</p>
                    {devis.isSigned && devis.signatureImg ? (
                        <div className="mt-4">
                            <img src={devis.signatureImg} alt="Signature Client" className="h-16 object-contain mix-blend-multiply" />
                            <p className="text-[8px] font-bold text-emerald-600 mt-2">Signé numériquement le {devis.signedAt?.toLocaleDateString('fr-FR')}</p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-gray-400 italic mt-8">(En attente de votre signature)</p>
                    )}
                </div>
                <div className="relative text-left">
                    <p className="font-bold text-[12px] underline mb-2">Pour l'ASSTSF (Validation Technique) :</p>
                    <p className="text-[10px] text-gray-900 font-bold mb-1">Sauveur AMICO, Président</p>
                    <div className="relative h-16 mt-2">
                        {/* Seulement la signature, sans le cachet */}
                        <img src="/pres.png" alt="Signature Président" className="absolute top-0 left-0 w-24 h-12 object-contain mix-blend-multiply" />
                    </div>
                </div>
            </div>
        </div>
    );


    // =======================================================
    // DOCUMENT 2 : CONVENTION
    // =======================================================
    const contenuConvention = (
        <div id="zone-pdf-convention" className="bg-white text-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-200 overflow-y-auto font-sans text-[12px] space-y-6 leading-relaxed text-justify mb-8">
            <div className="text-center pt-4 mb-8">
                <h1 className="text-2xl font-black uppercase border-y-2 border-black py-2 inline-block px-10 tracking-widest text-black">
                    CONVENTION DE PRESTATION
                </h1>
                <p className="mt-2 text-slate-500 font-medium text-[11px]">Réf. Événement : {devis.eventTitle}</p>
            </div>

            {/* En-tête de l'association */}
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-200 text-black text-left">
                <div className="flex items-center gap-4">
                    <div className="text-xs leading-tight">
                        <h2 className="text-sm font-black uppercase">ASSOCIATION DES SECOURISTES</h2>
                        <h3 className="font-bold text-xs uppercase text-slate-700">La Seyne-Tamaris-Six-Fours</h3>
                        <p className="text-[9px] text-gray-500 mt-0.5">98 rue Fontaine, Square Émile Malsert, 83500 La Seyne-sur-Mer</p>
                        <p className="text-[9px] text-gray-500">Siret: 401 715 107 00033 | R.N.A: W832006454</p>
                    </div>
                </div>
                <div className="text-right text-[9px] font-medium leading-tight text-gray-600">
                    <p>Président : 06.11.58.34.35 | Vice-Président : 06.99.70.91.63</p>
                    <p>Trésorier : 06.89.85.34.07 | Secrétaire : 06.75.69.31.12</p>
                    <p className="font-bold text-black mt-0.5">asst.laseyne@gmail.com</p>
                </div>
            </div>

            {/* Clauses Juridiques */}
            <p className="mb-4 indent-8 text-left">
                Monsieur, Madame, suite à votre demande de mise en place d'un Dispositif Prévisionnel de Secours à personnes (D.P.S), vous trouverez ci-joint les exemplaires de la convention précisant les modalités de notre accord. Vous voudrez bien les valider via votre espace numérique sécurisé.
            </p>

            <h3 className="font-bold uppercase text-[12px] bg-slate-100 text-black p-1 mb-2 text-left">1. Association Prestataire :</h3>
            <p className="mb-4 text-left text-slate-700">
                L'Association des Secouristes de la Seyne Tamaris Six-Fours, Adresse: 98 rue Fontaine, Square Émile Malsert, 83500 La Seyne-sur-Mer. Courriel: asst.laseyne@gmail.com. Ci-après désignée: association prestataire représentée par son président Sauveur AMICO: association ayant reçu notamment une autorisation d'exercice déconcentrée pour les missions de sécurité civile de type D par sa régulière affiliation à la Fédération Française de Sauvetage et de Secourisme (FFSS), association agréée de sécurité civile au plan national par arrêté ministériel.
            </p>

            <h3 className="font-bold uppercase text-[12px] bg-slate-100 text-black p-1 mb-2 text-left">2. Organisateur de l'événement :</h3>
            <p className="mb-4 text-slate-700 leading-relaxed text-left pl-1">
                Raison sociale de l'organisateur : <strong>{devis.organismeDemandeur || "Non renseigné"}</strong><br />
                Représenté par : <strong>{devis.nomContact || "Non renseigné"}</strong><br />
                Téléphone : {devis.telephoneContact || "Non renseigné"}<br />
                Adresse mail : {devis.emailContact || "Non renseigné"}
            </p>

            <h3 className="font-bold uppercase text-[12px] bg-slate-100 text-black p-1 mb-2 text-left">3. Objet de la convention :</h3>
            <p className="font-bold underline text-[11px] mb-1 text-black text-left">3.1 Objet</p>
            <p className="mb-3 text-left text-slate-700">
                La présente convention a pour but de fixer les modalités de fonctionnement entre l'Association des Secouristes de la Seyne Tamaris Six-Fours et le bénéficiaire pour la mise en place d'un Dispositif Prévisionnel de Secours à personnes, ceci afin de clarifier le cadre juridique de la prestation assurée.
            </p>

            <p className="font-bold underline text-[11px] mb-1 text-black text-left">3.2 Descriptif de l'événement :</p>
            <ul className="mb-4 list-disc ml-6 text-slate-700 text-left">
                <li>Nom de l'événement : <strong>{devis.eventTitle}</strong></li>
                <li>Date et heures : Du {devis.eventDate.toLocaleDateString('fr-FR')} ({devis.startTime || "--h--"}) au {devis.endDate?.toLocaleDateString('fr-FR') || devis.eventDate.toLocaleDateString('fr-FR')} ({devis.endTime || "--h--"})</li>
                <li>Adresse Précise : <strong>{devis.location}</strong></li>
            </ul>

            <p className="font-bold underline text-[11px] mb-1 text-black text-left">3.5 Responsabilités :</p>
            <p className="mb-4 text-left text-slate-700">
                Conformément aux textes réglementaires, l'organisateur est responsable de l'ensemble de l'organisation et des mesures prises en liaison avec l'autorité de police compétente (maire, préfet). La mise en place d'un dispositif de secours ne peut avoir pour conséquence un transfert de responsabilité vers l'association prestataire.
            </p>

            <h3 className="font-bold uppercase text-[12px] bg-slate-100 text-black p-1 mb-2 text-left">4. Prestations fournies par le prestataire :</h3>

            <p className="font-bold underline text-[11px] mb-1 text-black text-left">4.1 Type du dispositif mis en place :</p>
            <p className="mb-3 text-left text-slate-700">
                Pour répondre à la demande écrite formulée et au vu du résultat de la grille d'évaluation des risques renseignée, l'Association des Secouristes de la Seyne Tamaris Six-Fours, conformément aux directives du Référentiel National relatif aux Dispositifs Prévisionnels de Secours (RNDPS) - Ministère de l'intérieur arrêté NOR: INTE0600910A du 7 novembre 2006, s'engage à mettre en place le Dispositif Prévisionnel de Secours suivant :
            </p>

            <p className="font-bold underline text-[11px] mb-1 text-black text-left">4.2 Composition du dispositif :</p>
            <ul className="mb-4 list-disc ml-6 text-slate-700 text-left font-bold">
                <li>Nombre d'intervenants secouristes : {effectif}</li>
                <li>Véhicules de premiers secours : 0 VPSP</li>
                <li>Autres véhicules : 0</li>
            </ul>

            <p className="font-bold underline text-[11px] mb-1 text-black text-left">4.3 Informations concernant le dispositif :</p>
            <p className="mb-1 italic text-black font-semibold text-left">4.3.1 Les intervenants :</p>
            <p className="mb-2 text-left text-slate-700">
                Les équipiers secouristes sont titulaires du diplôme de Premiers Secours en Équipe de niveau 2 (PSE2) et les secouristes de niveau 1 (PSE1), validés dans leur aptitude opérationnelle conformément à la réglementation. Un membre de chaque équipe exerce les fonctions de chef d'équipe.
            </p>

            <p className="mb-1 italic text-black font-semibold text-left">4.3.2 Moyens matériels :</p>
            <p className="mb-4 text-left text-slate-700">
                Les différents lots de matériels mis à disposition sont conformes au RNDPS du 7 novembre 2006.
            </p>

            <p className="font-bold underline text-[11px] mb-1 text-black text-left">4.4 Missions :</p>
            <ul className="mb-4 text-left text-slate-700 ml-2 space-y-1">
                <li>1° Reconnaître et analyser la situation accidentelle.</li>
                <li>2° Prendre les premières mesures adaptées de sécurité.</li>
                <li>3° Faire un bilan et porter les premiers secours nécessaires à une victime.</li>
                <li>4° Prodiguer des conseils adaptés.</li>
                <li>5° Contribuer à la mise en place de la chaîne des secours (alerte / pouvoirs publics).</li>
                <li>6° Accueillir les secours et faciliter leur intervention.</li>
            </ul>

            <p className="font-bold underline text-[11px] mb-1 text-black text-left">4.5 Transport des victimes :</p>
            <p className="mb-4 text-left text-slate-700">
                L'association prestataire n'assurera pas le transport des victimes vers un centre hospitalier. Les éventuelles évacuations des blessés ou malades sont assurées par les services publics de secours.
            </p>

            <p className="font-bold underline text-[11px] mb-1 text-black text-left">4.6 Modalités opérationnelles :</p>
            <p className="mb-4 text-left text-slate-700">
                Les intervenants sont revêtus de leur tenue officielle. Le chef de poste prendra contact avec le bénéficiaire dès son arrivée sur site pour vérifier la concordance avec les clauses techniques. Les intervenants et véhicules sont dotés de moyens radio sur fréquence propre.
            </p>

            <h3 className="font-bold uppercase text-[12px] bg-slate-100 text-black p-1 mb-2 text-left">5. Engagements de l'organisateur :</h3>
            <p className="mb-1 font-bold text-[11px] underline text-black text-left">5.1 Aspects logistiques :</p>
            <p className="mb-2 text-left text-slate-700">
                - 1 tente ou local à disposition des secouristes.<br />
                - Un moyen d'appel des secours publics en cas de non couverture des mobiles.
            </p>

            <p className="mb-1 text-emerald-700 font-bold text-[11px] text-left">Prise en charge restauration / boissons :</p>
            <p className="mb-4 border-l-2 border-emerald-500 pl-2 font-medium text-emerald-950 text-left bg-emerald-50/30 py-1">
                Les repas et les boissons des secouristes présents seront pris en charge par l'organisateur.
            </p>

            <p className="mb-4 text-[12px] text-slate-900 text-left">
                <strong>5.2 Modalités opérationnelles :</strong> Correspondant : M. {devis.nomContact || "Non renseigné"} (Tél: {devis.telephoneContact || "Non renseigné"}). Le commandement du dispositif sera assuré par l'association prestataire.
            </p>

            <p className="font-bold underline text-[11px] mb-1 text-black text-left">5.3 Modalités financières :</p>
            <p className="mb-6 text-left text-slate-700">
                L'intervention des secouristes demeure bénévole (but non lucratif). Toutefois, l'organisateur dédommage l'association des frais engendrés, pour un montant défini dans le devis remis ultérieurement par l'association. Cette somme sera réglée par virement ou par chèque libellé à l'ordre de l'Association.
            </p>

            <h3 className="font-bold uppercase text-[12px] bg-slate-100 text-black p-1 mb-2 text-left mt-6">9. Litiges :</h3>
            <p className="mb-6 text-left text-slate-700">
                En cas de litige, le contentieux pourra faire l'objet de recours devant les tribunaux compétents. Les informations recueillies font l'objet d'un traitement destiné à l'établissement de documents réglementaires. La durée de conservation des données est de 20 ans après la fin de l'événement (code de la santé publique : article R1112-7).
            </p>

            {/* DOUBLE SIGNATURE POUR LA CONVENTION (AVEC TAMPON) */}
            <div className="grid grid-cols-2 gap-12 mt-12 pt-4 border-t-2 border-black text-black">
                <div className="text-left">
                    <p className="font-bold text-[12px] underline mb-2">Pour l'organisateur :</p>
                    {devis.isSigned && devis.signatureImg ? (
                        <div className="mt-4">
                            <img src={devis.signatureImg} alt="Signature Client" className="h-20 object-contain mix-blend-multiply" />
                            <p className="text-[8px] font-bold text-emerald-600 mt-2">Signé numériquement le {devis.signedAt?.toLocaleDateString('fr-FR')}</p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-gray-400 italic mt-8">(En attente de votre signature)</p>
                    )}
                </div>
                <div className="relative text-left">
                    <p className="font-bold text-[12px] underline mb-2">Pour l'Association :</p>
                    <p className="text-[10px] text-gray-900 font-bold mb-1">Sauveur AMICO, Président de l'ASSTSF</p>
                    <div className="relative h-24 mt-2">
                        {/* Cachet et signature superposés */}
                        <img src="/cachet-asso.png" alt="Cachet ASSTSF" className="absolute top-0 left-0 w-48 h-48 object-contain opacity-80" />
                        <img src="/pres.png" alt="Signature Président" className="absolute top-4 left-12 w-32 h-16 object-contain mix-blend-multiply" />
                    </div>
                </div>
            </div>
        </div>
    );

    // =======================================================
    // AFFICHAGE DE LA PAGE (HTML FINAL)
    // =======================================================
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-16">
            <Link href="/profile" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                <ArrowLeft size={16} /> Retour à mon espace
            </Link>

            <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3">
                    <FileSignature className="text-blue-600" /> Validation Juridique
                </h2>
                <p className="text-slate-500 text-sm">Veuillez prendre connaissance des deux documents ci-dessous avant de procéder à la signature électronique.</p>
            </div>

            {/* SECTION 1 : LE RIS */}
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 ml-4">
                    Document 1 / 2 : Rapport Initial de Sécurité
                </h3>
                {contenuRIS}
            </div>

            {/* SECTION 2 : LA CONVENTION */}
            <div className="pt-8 border-t border-slate-200">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 ml-4">
                    Document 2 / 2 : Convention de Prestation
                </h3>
                {contenuConvention}
            </div>

            {/* ZONE D'ACTION */}
            {devis.isSigned ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-emerald-500/30">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-black uppercase text-emerald-700 dark:text-emerald-400">Dossier Validé</h3>
                    <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 max-w-md">
                        Votre convention et la fiche RIS ont été signées électroniquement le {devis.signedAt?.toLocaleDateString('fr-FR')}. Vous pouvez télécharger vos documents officiels.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <DownloadPdfButton
                            targetId="zone-pdf-ris"
                            fileName={`RIS_${devis.eventTitle.replace(/\s+/g, '_')}.pdf`}
                        />
                        <DownloadPdfButton
                            targetId="zone-pdf-convention"
                            fileName={`Convention_Signee_${devis.eventTitle.replace(/\s+/g, '_')}.pdf`}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#001A3D] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl">
                    <div className="mb-6">
                        <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">
                            Signature conjointe
                        </h3>
                        <p className="text-sm text-slate-500">
                            En apposant votre signature ci-dessous, elle s'appliquera automatiquement et juridiquement sur les deux documents (Fiche RIS et Convention).
                        </p>
                    </div>
                    <SignatureClient devisId={devis.id} />
                </div>
            )}
        </div>
    );
}