import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientDevisFormation from "@/components/admin/ClientDevisFormation";
import FinancePanel from "@/components/admin/FinancePanel";

export default async function DevisFormationPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const inscription = await prisma.inscription.findUnique({
        where: { id },
        include: {
            formation: true,
            user: true,
            session: true, // On demande les infos de la session
            paiements: { orderBy: { createdAt: "desc" } }
        }
    });

    if (!inscription) notFound();

    const templateFormation = await prisma.emailTemplate.findUnique({
        where: { type: "FORMATION" }
    });

    // 🪛 NOUVEAU : Récupération de l'IBAN depuis la table SiteContent
    const ibanRecord = await prisma.siteContent.findUnique({
        where: { key: "IBAN_ASSO" }
    });
    const ibanAsso = ibanRecord?.value;

    return (
        // 👈 On enveloppe les deux composants dans une div avec un espacement (space-y-8)
        <div className="space-y-8">
            <ClientDevisFormation
                inscription={inscription}
                templateBody={templateFormation?.body}
                ibanAsso={ibanAsso} // 🪛 Ajout de la prop ici
            />

            {/* 🆕 Le panneau financier est ajouté juste en dessous */}
            <FinancePanel inscription={inscription} />
        </div>
    );
}