"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function ajouterPaiement(data: {
    inscriptionId: string;
    montant: number;
    mode: "CHEQUE" | "LIQUIDE" | "VIREMENT";
    nomPayeur?: string;
    numCheque?: string;
    note?: string;
}) {
    try {
        await prisma.paiement.create({
            data: {
                inscriptionId: data.inscriptionId,
                montant: data.montant,
                mode: data.mode,
                nomPayeur: data.nomPayeur,
                numCheque: data.numCheque,
                note: data.note,
            }
        });

        // On rafraîchit les pages d'administration pour mettre à jour les calculs
        revalidatePath(`/admin/inscriptions/${data.inscriptionId}`);
        revalidatePath(`/admin/inscriptions`);

        return { success: true };
    } catch (error: any) {
        console.error("Erreur lors de l'ajout du paiement:", error);
        return { success: false, error: "Impossible d'enregistrer le paiement." };
    }
}
export async function setPrixTotal(inscriptionId: string, prixTotal: number) {
    try {
        await prisma.inscription.update({
            where: { id: inscriptionId },
            data: { prixTotal }
        });
        revalidatePath(`/admin/inscriptions/${inscriptionId}`);
        revalidatePath(`/admin/inscriptions`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Impossible de mettre à jour le prix." };
    }
}
