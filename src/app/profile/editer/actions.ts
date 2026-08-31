"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Fonction pour récupérer les vraies informations de l'utilisateur connecté
export async function getUserProfile() {
    const session = await auth();
    if (!session || !session.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    return user;
}

// 2. Fonction pour sauvegarder les modifications
export async function updateUserProfile(data: { name: string, phone: string, structure: string }) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return { error: "Vous n'êtes pas connecté." };
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: data.name,
                phone: data.phone,
                structure: data.structure
            }
        });

        // Rafraîchit le cache pour que le tableau de bord affiche le nouveau nom
        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la mise à jour :", error);
        return { error: "Une erreur est survenue lors de l'enregistrement." };
    }
}