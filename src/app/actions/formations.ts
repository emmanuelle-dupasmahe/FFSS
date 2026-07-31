"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Crée une nouvelle demande d'inscription/devis
 */
export async function createInscription(formData: FormData) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Vous devez être connecté pour soumettre une demande." };
    }

    // 1. Extraction des données du formulaire
    const typeDemande = formData.get("type") as string;
    const sessionId = formData.get("sessionId") as string;
    const structureName = formData.get("structureName") as string;
    const siret = formData.get("siret") as string;
    const participants = formData.get("participants") as string;

    const hasBNSSA = formData.get("hasBNSSA") === "true";
    const hasPSE1 = formData.get("hasPSE1") === "true";
    const hasPSE2 = formData.get("hasPSE2") === "true";
    const needRecyclage = formData.get("needRecyclage") === "true";

    const location = formData.get("location") as string;
    const message = formData.get("message") as string;
    const swimLevel = formData.get("swimLevel") as string;

    try {
        // 2. Recherche directe par ID strict
        const formationId = formData.get("formationId") as string;

        const formation = await prisma.formation.findUnique({
            where: { id: formationId }
        });

        if (!formation || !formation.isActive) {
            return { error: "La formation sélectionnée n'est pas disponible (vérifiez qu'elle est bien activée/visible dans l'administration)." };
        }

        // 3. Création de l'inscription
        const inscription = await prisma.inscription.create({
            data: {
                typeDemande: typeDemande,
                structureName: typeDemande === "STRUCTURE" ? structureName : null,
                siret: typeDemande === "STRUCTURE" ? siret : null,
                expectedParticipants: parseInt(participants) || 1,

                hasBNSSA,
                hasPSE1,
                hasPSE2,
                needRecyclage,

                location: location || "Centre ASSTSF",
                swimLevel: swimLevel,
                message: message,
                status: "EN_ATTENTE",

                formationId: formation.id,
                userId: session.user.id,
                sessionId: (sessionId && sessionId !== "" && sessionId !== "null" && sessionId !== "undefined") ? sessionId : null,
            },
        });

        // 4. Mise à jour du cache
        revalidatePath("/admin/inscriptions");
        revalidatePath("/admin");

        return { success: true, id: inscription.id };

    } catch (error: any) {
        console.error("ERREUR CRÉATION INSCRIPTION:", error.message);
        return { error: "Une erreur technique est survenue lors de l'enregistrement." };
    }
}

/**
 * Met à jour le statut d'une inscription (Admin)
 */
export async function updateInscriptionStatus(id: string, newStatus: string) {
    try {
        await prisma.inscription.update({
            where: { id },
            data: { status: newStatus },
        });

        // Mise à jour des pages concernées pour refléter le changement immédiatement
        revalidatePath("/admin/inscriptions");
        revalidatePath(`/admin/inscriptions/${id}`);
        revalidatePath("/admin"); // Pour mettre à jour les compteurs du dashboard principal

        return { success: true };
    } catch (error) {
        console.error("ERREUR MAJ STATUT:", error);
        return { error: "Erreur lors de la mise à jour du statut." };
    }
}

/**
 * Met à jour les ressources documentaires d'une formation
 */
export async function updateFormationRessources(formationId: string, ressourcesToSave: any[]) {
    try {
        // 1. On supprime toutes les anciennes ressources liées à cette formation
        // C'est la méthode la plus fiable pour gérer les ajouts/modifications/suppressions d'un coup
        await prisma.ressource.deleteMany({
            where: { formationId: formationId }
        });

        // 2. S'il y a des ressources à sauvegarder, on les insère toutes
        if (ressourcesToSave.length > 0) {
            const dataToInsert = ressourcesToSave.map(r => ({
                title: r.title,
                url: r.url,
                type: r.type,
                formationId: formationId
            }));

            await prisma.ressource.createMany({
                data: dataToInsert
            });
        }

        // 3. On rafraîchit le cache pour l'admin et pour l'espace des stagiaires
        revalidatePath(`/admin/formations/${formationId}`);
        revalidatePath(`/espace-stagiaire`);

        return { success: true };
    } catch (error) {
        console.error("ERREUR updateFormationRessources:", error);
        throw new Error("Erreur lors de la sauvegarde des ressources");
    }
}
/**
 * Supprime définitivement une inscription (Admin)
 */
export async function deleteInscription(id: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Vous devez être connecté pour effectuer cette action." };
    }

    try {
        await prisma.inscription.delete({
            where: { id },
        });

        // Mise à jour des pages concernées pour refléter la suppression
        revalidatePath("/admin/inscriptions");
        revalidatePath("/admin");

        return { success: true };
    } catch (error: any) {
        console.error("ERREUR SUPPRESSION INSCRIPTION:", error.message);
        return { error: "Erreur lors de la suppression du dossier." };
    }
}