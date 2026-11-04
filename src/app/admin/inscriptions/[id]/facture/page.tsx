import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientFactureFormation from "@/components/admin/ClientFactureFormation";

export default async function FactureFormationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const inscription = await prisma.inscription.findUnique({
        where: { id },
        include: {
            formation: true,
            user: true,
            session: true,
            paiements: { orderBy: { createdAt: "desc" } }
        }
    });

    if (!inscription) notFound();

    const templateFacture = await prisma.emailTemplate.findUnique({
        where: { type: "FACTURE_FORMATION" }
    });

    const contents = await prisma.siteContent.findMany({
        where: { key: { in: ["IBAN_ASSO", "BIC_ASSO", "footer_address"] } }
    });
    const getVal = (k: string) => contents.find(c => c.key === k)?.value;

    return (
        <ClientFactureFormation
            inscription={inscription}
            templateBody={templateFacture?.body}
            ibanAsso={getVal("IBAN_ASSO")}
            bicAsso={getVal("BIC_ASSO")}
            adresseAsso={getVal("footer_address")}
        />
    );
}
