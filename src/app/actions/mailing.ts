"use server";

import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

export async function envoyerMailCible(formationId: string, subject: string, htmlContent: string) {
    try {
        // 1. Récupérer les e-mails des stagiaires dont l'inscription est VALIDEE
        const inscriptions = await prisma.inscription.findMany({
            where: {
                formationId: formationId,
                status: "VALIDEE",
                user: {
                    // 🪛 LA CORRECTION EST ICI : on cherche le caractère '@'
                    email: {
                        contains: "@"
                    }
                }
            },
            include: {
                user: true
            }
        });

        // Extraire les adresses e-mail uniques
        const emailsCibles = Array.from(new Set(inscriptions.map(ins => ins.user.email)));

        if (emailsCibles.length === 0) {
            return { success: false, message: "Aucun stagiaire trouvé avec une adresse e-mail valide pour cette formation." };
        }

        // 2. Envoyer les e-mails
        const envois = emailsCibles.map(email => {
            return sendMail({
                to: email as string,
                subject: subject,
                html: htmlContent
            });
        });

        await Promise.all(envois);

        return { success: true, message: `${emailsCibles.length} e-mail(s) envoyé(s) avec succès !` };

    } catch (error) {
        console.error("Erreur lors de l'envoi du mailing ciblé :", error);
        return { success: false, message: "Une erreur technique est survenue lors de l'envoi." };
    }
}