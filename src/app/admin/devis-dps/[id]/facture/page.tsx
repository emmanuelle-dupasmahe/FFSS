import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientFacture from "@/components/admin/ClientFacture";

export default async function FacturePage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // 1. Récupération des données de la mission
    // 🛠️ CORRECTION : Ajout de "include: { user: true }" pour bien récupérer l'email !
    const devis = await prisma.devisDPS.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!devis) notFound();
    const templateFacture = await prisma.emailTemplate.findUnique({
        where: { type: "FACTURE" }
    });

    // 2. Calcul des constantes de base
    const p2 = devis.p2 || 0.25;
    const e1 = devis.e1 || 0.25;
    const e2 = devis.e2 || 0.25;
    const p1 = Number(devis.expectedPublic || 0);
    const p_lisse = p1 <= 100000 ? p1 : 100000 + (p1 - 100000) / 2;
    const i = p2 + e1 + e2;
    const ris = i * (p_lisse / 1000);

    // Calcul de l'effectif selon le référentiel
    let effectif = ris <= 1.125 ? 2 : Math.max(4, Math.ceil(ris / 2) * 2);
    if (ris > 12) effectif = Math.max(12, Math.ceil(ris / 2) * 2);
    if (ris > 36) effectif = Math.max(36, Math.ceil(ris / 2) * 2);

    // Calcul brut de secours
    const TARIF_HORAIRE = 17;
    const heuresBase = 9; // 8h + 1h prépa
    const calculBrut = effectif * heuresBase * TARIF_HORAIRE;

    // 3. LA MAGIE : On récupère le VRAI total enregistré lors du devis (avec remise)
    // ⚠️ Remplace "total" par le nom exact de ton champ si nécessaire (ex: montantTotal, prixFinal...)
    const montantFacture = devis.totalMontant ?? calculBrut;

    return (
        <ClientFacture
            effectifInitial={effectif}
            eventTitle={devis.eventTitle}
            location={devis.location}
            totalInitial={montantFacture}
            devisDpsId={devis.id}
            userEmail={devis.user?.email || ""}
            templateBody={templateFacture?.body}
            organismeDemandeur={devis.organismeDemandeur}
            nomContact={devis.nomContact}
            telephoneContact={devis.telephoneContact}
            eventDate={devis.eventDate}
            endDate={devis.endDate}
        />
    );
}