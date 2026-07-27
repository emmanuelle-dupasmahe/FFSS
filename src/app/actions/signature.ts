"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveSignature(devisId: string, signatureBase64: string) {
    try {
        // 1. Vérification de la sécurité
        const session = await auth();
        if (!session || !session.user?.email) {
            return { success: false, error: "Non autorisé" };
        }

        // 2. Vérifier que le devis appartient bien à cet utilisateur
        const devis = await prisma.devisDPS.findUnique({
            where: { id: devisId },
            include: { user: true }
        });

        if (!devis || devis.user.email !== session.user.email) {
            return { success: false, error: "Document introuvable ou accès refusé" };
        }

        // 3. Mise à jour de la base de données
        await prisma.devisDPS.update({
            where: { id: devisId },
            data: {
                isSigned: true,
                signedAt: new Date(),
                signatureImg: signatureBase64
            }
        });

        // 4. On rafraîchit les pages de l'espace client pour afficher le macaron vert
        revalidatePath(`/profile/conventions/${devisId}`);
        revalidatePath(`/profile`);

        return { success: true };
    } catch (error) {
        console.error("Erreur saveSignature:", error);
        return { success: false, error: "Erreur serveur" };
    }
}
export async function saveDevisSignature(devisId: string, signatureBase64: string) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return { success: false, error: "Non autorisé" };
        }

        const devis = await prisma.devisDPS.findUnique({
            where: { id: devisId },
            include: { user: true }
        });

        if (!devis || devis.user.email !== session.user.email) {
            return { success: false, error: "Document introuvable ou accès refusé" };
        }

        // On met à jour les champs spécifiques au DEVIS
        await prisma.devisDPS.update({
            where: { id: devisId },
            data: {
                devisIsSigned: true,
                devisSignedAt: new Date(),
                devisSignatureImg: signatureBase64
            }
        });

        revalidatePath(`/profile/conventions/${devisId}`);
        revalidatePath(`/profile`);
        
        return { success: true };
    } catch (error) {
        console.error("Erreur saveDevisSignature:", error);
        return { success: false, error: "Erreur serveur" };
    }
}