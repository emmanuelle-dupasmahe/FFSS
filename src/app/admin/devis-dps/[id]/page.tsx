import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Banknote, Info, FileText, Building2, User, Phone, Mail, Box, Calendar, Clock, CheckCircle2 } from "lucide-react";
import PrintButton from "@/components/admin/PrintButton";
import IndicatorTable from "@/components/admin/IndicatorTable";
import SendEmailButton from "@/components/admin/SendEmailButton";
import ConventionGenerator from "@/components/admin/ConventionGenerator";
import DownloadPdfButton from "@/app/profile/conventions/[id]/DownloadPdfButton";
import DpsLogisticsEditor from "@/components/admin/DpsLogisticsEditor";

export default async function DetailDevisPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const devis = await prisma.devisDPS.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!devis) notFound();

  const templateRis = await prisma.emailTemplate.findUnique({
    where: { type: "RIS" }
  });

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
  else if (ris <= 1.125) qualification = "PAPS (Point d'Alerte et de Premiers Secours)";
  else if (ris <= 12) qualification = "DPS de petite envergure (PE)";
  else if (ris <= 36) qualification = "DPS de moyenne envergure (ME)";
  else qualification = "DPS de grande envergure (GE)";

  // 🚨 RÈGLE D'EXCEPTION : Surclassement en PE si E2 est supérieur ou égal à 0.40
  if (ris <= 1.125 && e2 >= 0.40) {
    qualification = "DPS de petite envergure (PE)";
  }

  // Le calcul de l'effectif se base sur la qualification finale
  let effectif = (qualification === "Diligence autorité de police" || qualification === "PAPS (Point d'Alerte et de Premiers Secours)")
    ? 2
    : Math.max(4, Math.ceil(ris / 2) * 2);

  if (ris > 12) effectif = Math.max(12, Math.ceil(ris / 2) * 2);
  if (ris > 36) effectif = Math.max(36, Math.ceil(ris / 2) * 2);

  const formatDate = (date: Date) => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // --- NOUVEAU : Traducteurs pour afficher les textes longs sur le PDF ---
  const getLabelP2 = (val: string | null | undefined) => {
    if (val === "Calme") return "Assis (cérémonie, spectacle …)";
    if (val === "Peu dynamique") return "Debout statique (foire, …)";
    if (val === "Dynamique") return "Debout dynamique (fête foraine, …)";
    if (val === "Très dynamique") return "Debout très dynamique  (dance, féria, …)";
    return val || "Non renseigné";
  };

  const getLabelE1 = (val: string | null | undefined) => {
    if (val === "Facile") return "Structure permanente, voie publique";
    if (val === "Intermédiaire") return "Structure non permanente, espaces naturel -2ha avec peu de pente";
    if (val === "Difficile") return "Espace naturel -5ha avec de la pente";
    if (val === "Complexe") return "Espace naturel accidenté + de 5ha, progression des secours rendue difficile par le public";
    return val || "Non renseigné";
  };

  return (
    <div className="print:p-0 print:min-h-0 min-h-screen bg-slate-50 dark:bg-[#001A3D] p-4 md:p-8 transition-colors duration-300 relative">

      {/* --- INTERFACE SITE (ÉCRAN) --- */}
      <div className="max-w-5xl mx-auto no-print space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
          <Link href="/admin/devis-dps" className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600">
            <ArrowLeft size={16} /> Retour
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
              <SendEmailButton
                devisId={devis.id}
                email={devis.emailContact || devis.user?.email || ""}
                eventTitle={devis.eventTitle}
                templateBody={templateRis?.body}
              />
              <PrintButton />
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-300 dark:bg-white/20 mx-2"></div>

            {/* Indicateur Visuel de Signature RIS/CONV */}
            {devis.isSigned ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default">
                <ShieldCheck size={16} /> Dossier Signé
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default">
                Dossier en attente
              </div>
            )}

            {/* Indicateur Visuel de Signature DEVIS */}
            {devis.devisIsSigned ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default">
                <Banknote size={16} /> Devis Signé
              </div>
            ) : (
              <Link href={`/admin/devis-dps/${id}/chiffrage`} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5">
                <Banknote size={16} /> Étape 2 : Devis
              </Link>
            )}

            <Link href={`/admin/devis-dps/${id}/facture`} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5">
              <FileText size={16} /> Étape 3 : Facture
            </Link>

          </div>
        </div>

        {/* COORDONNÉES ÉCRAN */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-600 p-6 rounded-3xl text-white flex flex-col justify-center shadow-lg">
            <Building2 size={32} className="mb-4 opacity-80" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Organisateur</h2>
            <p className="font-black text-lg leading-tight">{devis.organismeDemandeur || "Non renseigné"}</p>
          </div>
          <div className="md:col-span-3 bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Contact sur place</p>
                <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <User size={16} className="text-blue-600" />
                  {devis.nomContact || devis.user?.name || "Non renseigné"}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Téléphone</p>
                <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <Phone size={16} className="text-blue-600" />
                  {devis.telephoneContact || "Non renseigné"}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email</p>
                <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <Mail size={16} className="text-blue-600" />
                  <span className="truncate">{devis.emailContact || devis.user?.email || "Non renseigné"}</span>
                </div>
              </div>

              <div className="md:col-span-3 bg-white dark:bg-white/5 p-6 rounded-3xl border shadow-sm flex items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Dates de l'événement</p>
                    <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                      <Calendar size={16} className="text-blue-600" />
                      {formatDate(new Date(devis.eventDate))}
                      {devis.endDate && ` au ${formatDate(new Date(devis.endDate))}`}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Horaires</p>
                    <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                      <Clock size={16} className="text-blue-600" />
                      {devis.startTime || "??:??"} - {devis.endTime || "??:??"}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* CARACTÉRISTIQUES DU SITE ÉCRAN (ÉDITABLE) */}
        <DpsLogisticsEditor devis={devis} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
              <h1 className="text-2xl font-black uppercase italic mb-8 text-slate-900 dark:text-white">Analyse des <span className="text-blue-600 dark:text-blue-400">Indicateurs</span></h1>
              <div className="theme-adaptive-table">
                <IndicatorTable
                  devisId={devis.id}
                  initialP2={p2}
                  initialE1={e1}
                  initialE2={e2}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-blue-600 p-8 rounded-[2.5rem] text-slate-900 dark:text-white shadow-xl border border-slate-200 dark:border-transparent transition-colors">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/80">Effectif Préconisé</span>
              <div className="text-5xl font-black italic my-2">{effectif}</div>
              <p className="text-sm font-bold uppercase text-slate-600 dark:text-white/90">Secouristes</p>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/20 flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-white/70">Classification</p>
                  <p className="text-xs font-black uppercase text-blue-600 dark:text-white">{qualification}</p>
                </div>
                <ShieldCheck size={32} className="text-blue-600 dark:text-white" />
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 transition-colors">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4">
                <Info size={18} />
                <span className="text-xs font-black uppercase italic text-slate-900 dark:text-white">Détail du calcul</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Somme indices (i) :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{i.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Public (P1) :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{p1.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-100 dark:border-white/10 pt-2 flex justify-between text-blue-600 dark:text-blue-400 font-black">
                  <span>Score RIS :</span>
                  <span>{ris.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- ZONE CONVENTION SÉPARÉE --- */}
        <div className="mt-12 border-t pt-8 border-slate-200 dark:border-white/10">
          <h2 className="text-2xl font-black uppercase italic mb-6 text-slate-900 dark:text-white">Gestion Convention</h2>
          <ConventionGenerator
            demandeDPS={devis}
            calculRIS={{
              nombreSecouristes: effectif,
              nombreVehicules: Math.floor(effectif / 4)
            }}
          />
        </div>

        {/* --- NOUVELLE ZONE FINANCIÈRE --- */}
        {(devis.status === "TRAITE" || devis.totalMontant) && (
          <div className="mt-12 border-t pt-8 border-slate-200 dark:border-white/10">
            <h2 className="text-2xl font-black uppercase italic mb-6 text-slate-900 dark:text-white">Validation Financière</h2>
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Montant Chiffré</p>
                <p className="text-3xl font-black text-blue-600">{devis.totalMontant?.toLocaleString('fr-FR')} €</p>
              </div>

              <div className="flex-1 flex justify-center">
                {devis.devisIsSigned && devis.devisSignatureImg ? (
                  <div className="flex flex-col items-center bg-emerald-50 border border-emerald-100 p-4 rounded-2xl w-full max-w-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Accord Client ({devis.devisSignedAt?.toLocaleDateString('fr-FR')})
                    </p>
                    <img src={devis.devisSignatureImg} alt="Signature Client" className="h-16 object-contain mix-blend-multiply" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full max-w-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                      <Banknote size={16} /> En attente de validation
                    </p>
                    <p className="text-xs text-slate-500 italic">Le client n'a pas encore signé le devis.</p>
                  </div>
                )}
              </div>

              {/* 🆕 BOUTONS D'ACTION (TELECHARGER ET OUVRIR) */}
              <div className="flex flex-col items-stretch gap-3">
                {devis.devisIsSigned && (
                  <DownloadPdfButton
                    targetId="document-devis-financier-admin"
                    fileName={`Devis_Signe_${devis.eventTitle.replace(/\s+/g, '_')}.pdf`}
                  />
                )}
                <Link href={`/admin/devis-dps/${id}/chiffrage`} className="flex justify-center items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap">
                  <Banknote size={18} /> {devis.devisIsSigned ? "Voir le chiffrage" : "Modifier le chiffrage"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 👇 FEUILLE PDF OFFICIELLE DU DEVIS (Cachée, sert uniquement pour l'export du bouton Télécharger) */}
      {devis.devisIsSigned && (
        <div className="no-print" style={{ position: "fixed", left: "-9999px", top: "0px" }}>
          <div id="document-devis-financier-admin" className="bg-white text-slate-900 font-sans" style={{ width: '210mm', minHeight: '297mm', padding: '15mm', boxSizing: 'border-box' }}>
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8 text-left">
              <div className="flex items-center gap-4">
                <img src="/log_asstsf.png" alt="ASSTSF Logo" className="w-20 h-20 object-contain" />
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">Devis Financier</h1>
                  <p className="text-sm font-bold text-slate-500 mt-1">Réf: DEV-{devis.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-slate-400 mt-4">Émis le {new Date(devis.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Organisateur</p>
                <p className="font-bold text-sm">{devis.organismeDemandeur || devis.user.name}</p>
                <p className="text-xs text-slate-600">{devis.emailContact || devis.user.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Événement</p>
                <p className="font-bold text-sm">{devis.eventTitle}</p>
                <p className="text-xs text-slate-600">Le {devis.eventDate.toLocaleDateString('fr-FR')} à {devis.location}</p>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="font-black uppercase text-[12px] bg-slate-100 text-black p-2 mb-4 text-left">Détail de la prestation :</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider">Désignation de la prestation</th>
                      <th className="p-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider text-right">Montant estimatif</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-slate-100">
                        <p className="font-bold text-slate-900">Forfait Dispositif Prévisionnel de Secours</p>
                        <p className="text-xs text-slate-500 mt-1">Mobilisation des équipes (incluant installation/rangement), matériel technique et déplacements associés (le cas échéant) selon la fiche de dimensionnement établie.</p>
                      </td>
                      <td className="p-4 border-b border-slate-100 text-right font-black text-slate-900 align-top">
                        {devis.totalMontant ? devis.totalMontant.toLocaleString('fr-FR') : "--"} €
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-emerald-50/50 p-6 flex justify-between items-center border-t border-slate-200">
                  <div className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed text-left">
                    <p>TVA non applicable (art. 261-7-1 du CGI)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600 uppercase mb-1">Total Net à Payer</p>
                    <div className="text-4xl font-black italic tracking-tighter text-slate-900">
                      {devis.totalMontant ? devis.totalMontant.toLocaleString('fr-FR') : "0"} €
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚨 LES DEUX SIGNATURES INTÉGRÉES POUR L'ADMIN */}
            <div className="mt-auto pt-8 border-t-2 border-slate-100">
              <div className="grid grid-cols-2 gap-10">
                <div className="relative">
                  <p className="text-[10px] font-black uppercase underline italic mb-4">L'Association ASSTSF :</p>
                  <p className="text-[10px] text-gray-900 font-bold mb-1">Sauveur AMICO, Président</p>
                  <div className="relative h-24 mt-2">
                    <img src="/cachet-asso.png" alt="Cachet ASSTSF" className="absolute top-0 left-0 w-48 h-48 object-contain opacity-80" />
                    <img src="/pres.png" alt="Signature Président" className="absolute top-4 left-12 w-32 h-16 object-contain mix-blend-multiply" />
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-[10px] font-black uppercase underline italic mb-4">Le Client / L'Organisateur :</p>
                  <img src={devis.devisSignatureImg || ""} alt="Signature Client" className="h-16 object-contain mix-blend-multiply" />
                  <p className="text-[7px] font-bold text-emerald-600 mt-2">
                    Signé numériquement le {devis.devisSignedAt?.toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👇 FEUILLE PDF OFFICIELLE DU RIS */}
      <div id="zone-pdf-officiel" className="only-print flex flex-col p-[10mm] box-border bg-white text-black font-sans">
        {/* Entête */}
        <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-4 shrink-0">
          <div className="flex items-center gap-4">
            <img src="/log_asstsf.png" alt="Logo" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-xl font-black uppercase leading-none">ASSTSF</h2>
              <p className="text-[9px] font-bold text-gray-600 uppercase">Agréé Sécurité Civile - FFSS</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black uppercase italic leading-tight">Fiche de Dimensionnement</h1>
            <p className="text-[9px] font-bold text-blue-600">RÉFÉRENTIEL NATIONAL DES DPS</p>
          </div>
        </div>

        {/* COORDONNÉES ET SITE */}
        <div className="grid grid-cols-2 border border-black mb-4 shrink-0">
          <div className="p-3 border-r border-black bg-gray-50 text-[11px] space-y-0.5">
            <p className="text-[8px] font-black uppercase text-gray-400">Organisme demandeur :</p>
            <p className="font-black uppercase text-black">{devis.organismeDemandeur || "Non renseigné"}</p>
            <p>Contact : {devis.nomContact || devis.user?.name || "Non renseigné"}</p>
            <p>Tél : {devis.telephoneContact || "Non renseigné"}</p>
          </div>
          <div className="p-3 bg-gray-50 text-[11px] space-y-0.5">
            <p className="text-[8px] font-black uppercase text-gray-400">Manifestation :</p>
            <p className="font-black uppercase text-black">{devis.eventTitle}</p>
            <p>Lieu : <span className="font-bold uppercase">{devis.location}</span></p>
            <p>Date(s) : {devis.eventDate ? formatDate(new Date(devis.eventDate)) : ""} {devis.endDate && ` au ${formatDate(new Date(devis.endDate))}`}</p>
            <p className="font-bold text-[9px] text-gray-700">Logistique : {devis.superficie || "N/A"} | Dist. max : {devis.distanceMaxi || "N/A"} | Abri : {devis.fournitLocal ? "OUI" : "NON"}</p>
          </div>
        </div>

        {/* TABLEAU RIS */}
        <table className="w-full border-collapse border border-black mb-4 shrink-0 text-[11px]">
          <thead>
            <tr className="bg-gray-100 font-black uppercase">
              <th className="border border-black p-1.5 text-left">Indicateur de risque</th>
              <th className="border border-black p-1.5 text-center">Valeur</th>
              <th className="border border-black p-1.5 text-left">Caractéristiques</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1.5 font-bold">P2 - Type d'activité</td>
              <td className="border border-black p-1.5 text-center font-black">{p2.toFixed(2)}</td>
              <td className="border border-black p-1.5 font-semibold text-slate-800 text-[10px]">
                {getLabelP2(devis.ambiance)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold">E1 - Environnement</td>
              <td className="border border-black p-1.5 text-center font-black">{e1.toFixed(2)}</td>
              <td className="border border-black p-1.5 font-semibold text-slate-800 text-[10px]">
                {getLabelE1(devis.accessibilite)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold">E2 - Secours publics</td>
              <td className="border border-black p-1.5 text-center font-black">{e2.toFixed(2)}</td>
              <td className="border border-black p-1.5 font-semibold text-slate-800 text-[10px]">
                {devis.delaiSecours || "Non renseigné"}
              </td>
            </tr>
            <tr className="bg-blue-50">
              <td className="border border-black p-1.5 font-black text-right" colSpan={2}>TOTAL (i) :</td>
              <td className="border border-black p-1.5 font-black text-lg">{i.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* SCORES ET CLASSIFICATION */}
        <div className="border border-black p-3 mb-4 flex justify-between items-center shrink-0 text-center">
          <div><p className="text-[8px] font-black uppercase text-gray-500">Public (P1)</p><p className="font-black text-lg">{p1.toLocaleString()}</p></div>
          <div className="border-x border-black px-4"><p className="text-[8px] font-black uppercase text-gray-500">Score RIS Final</p><p className="font-black text-2xl text-blue-600">{ris.toFixed(3)}</p></div>
          <div><p className="text-[8px] font-black uppercase text-gray-500">Classification</p><p className="font-black text-[10px] uppercase">{qualification}</p></div>
        </div>

        {/* DIMENSIONNEMENT */}
        <div className="border-4 border-black p-4 mb-4 flex justify-between items-center shrink-0">
          <h3 className="font-black uppercase italic">Dimensionnement Recommandé</h3>
          <p className="text-4xl font-black italic">{effectif} SECOURISTES</p>
        </div>

        {/* SIGNATURES */}
        <div className="grid grid-cols-2 gap-10 mt-12 pt-2 border-t border-black shrink-0">
          {/* Côté Organisateur avec gestion dynamique de la signature */}
          <div className="flex flex-col">
            <p className="text-[9px] font-black uppercase underline italic mb-1">L'Organisateur :</p>

            {devis.isSigned && devis.signatureImg ? (
              <div className="mt-2">
                <img src={devis.signatureImg} alt="Signature Client" className="h-16 object-contain mix-blend-multiply" />
                <p className="text-[7px] font-bold text-emerald-600 mt-1">Signé numériquement le {devis.signedAt?.toLocaleDateString('fr-FR')}</p>
              </div>
            ) : (
              <p className="text-[8px] text-gray-400 italic mb-16">Lu et approuvé (date et signature)</p>
            )}
          </div>


          {/* Côté ASSTSF (inchangé) */}
          <div className="relative">
            <p className="text-[9px] font-black uppercase underline italic mb-0.5">Pour l'ASSTSF :</p>
            <p className="text-[8px] font-black text-gray-900 uppercase">Sauveur AMICO, Président</p>

            <div className="relative h-12 mt-1">
              <img
                src="/pres.png"
                alt="Signature Président"
                className="absolute top-1 left-4 w-20 h-10 object-contain mix-blend-multiply"
              />
            </div>
            <p className="text-[7px] text-gray-500 mt-1">Le {formatDate(new Date())}</p>
          </div>
        </div>
      </div>
    </div>
  );
}