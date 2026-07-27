"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- 1. Mise à jour du statut ---
export async function updateInscriptionStatus(id: string, status: string) {
    try {
        await prisma.inscription.update({
            where: { id },
            data: { status }
        });
        // On rafraîchit la page pour voir le changement tout de suite
        revalidatePath("/admin/inscriptions");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
}

// --- 2.  Mise à jour du profil FFSS ---
export async function updateProfileFFSS(
    userId: string,
    data: {
        birthDate: string;
        birthPlace: string;
        address: string;
        zipCode: string;
        city: string;
        phone: string; // 🆕 Ajout du téléphone
    }
) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                birthPlace: data.birthPlace,
                address: data.address,
                zipCode: data.zipCode,
                city: data.city,
                phone: data.phone, // 🆕 Mise à jour en base
            },
        });

        revalidatePath("/admin/inscriptions");
        revalidatePath("/mon-espace");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Impossible de mettre à jour le profil." };
    }
}

// --- 3. Signature du devis de formation ---
export async function signFormationDevis(
    inscriptionId: string,
    signatureDataUrl: string
) {
    try {
        // On récupère l'inscription et les infos du stagiaire
        const inscription = await prisma.inscription.findUnique({
            where: { id: inscriptionId },
            include: { user: true },
        });

        if (!inscription) {
            return { success: false, error: "Dossier d'inscription introuvable." };
        }

        
        // Vérification stricte du profil FFSS (Uniquement pour les particuliers)
        if (inscription.typeDemande !== "STRUCTURE") {
            const { user } = inscription;
            if (!user.birthDate || !user.birthPlace || !user.address || !user.zipCode || !user.city) {
                return {
                    success: false,
                    error: "PROFIL_INCOMPLET",
                    message: "Veuillez compléter vos informations de naissance et d'adresse avant de signer."
                };
            }
        }

        // Logique de la liste d'attente
        let finalStatus = "VALIDEE"; // Statut par défaut (Attention : avec 2 'E' pour matcher ton schéma)

        // Si c'est un particulier inscrit à une session précise, on vérifie les places
        if (inscription.sessionId) {
            const sessionDetails = await prisma.session.findUnique({
                where: { id: inscription.sessionId },
                include: {
                    _count: {
                        select: {
                            inscriptions: {
                                // 🪛 On utilise la même logique ici pour être sûr du compte !
                                where: {
                                    status: {
                                        in: ["VALIDEE", "VALIDE", "Validée", "Validé", "VALIDÉ", "VALIDÉE"]
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (sessionDetails) {
                // Si le nombre de personnes validées est supérieur ou égal au max autorisé
                if (sessionDetails._count.inscriptions >= sessionDetails.maxParticipants) {
                    finalStatus = "ATTENTE"; // Le statut officiel de ta BDD pour la liste d'attente
                }
            }
        }

        // Enregistrement de la signature et validation (ou mise en attente) automatique
        await prisma.inscription.update({
            where: { id: inscriptionId },
            data: {
                isDevisSigned: true,
                devisSignedAt: new Date(),
                devisSignatureImg: signatureDataUrl,
                status: finalStatus, // 🪛 La bascule s'adapte aux places restantes
            },
        });

        revalidatePath("/admin/inscriptions");
        revalidatePath("/mon-espace");

        return {
            success: true,
            status: finalStatus
        };
    } catch (error) {
        console.error("Erreur lors de la signature du devis :", error);
        return { success: false, error: "Erreur technique lors de la signature." };
    }
}