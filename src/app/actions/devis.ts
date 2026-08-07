"use server";

import { sendMail } from "@/lib/mail";
import { generateDevisPdf } from "@/lib/pdf-generator";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================================================
// 1. FORMATIONS : ENVOI DU DEVIS
// ============================================================================

export async function processAndSendFormationDevis(
    inscriptionId: string,
    customMessage: string,
    pdfBase64: string,
    prixTotal: number
) {
    try {
        const inscription = await prisma.inscription.findUnique({
            where: { id: inscriptionId },
            include: { user: true, formation: true },
        });

        if (!inscription) return { success: false, error: "Demande d'inscription introuvable." };

        const numeroDevis = `FORM-${inscription.id.substring(0, 5).toUpperCase()}`;
        const base64Data = pdfBase64.split("base64,")[1];
        const pdfBuffer = Buffer.from(base64Data, "base64");

        // 🆕 SAUVEGARDE EN BASE DE DONNÉES
        // On enregistre le PDF dans le profil du stagiaire
        await prisma.inscription.update({
            where: { id: inscriptionId },
            data: {
                devisUrl: pdfBase64, // L'iframe gère parfaitement ce format
                status: "TRAITE",    // On passe le dossier en "attente de signature"
                prixTotal: prixTotal
            }
        });
        revalidatePath(`/admin/inscriptions/${inscriptionId}`);

        return await sendMail({
            to: inscription.user.email,
            subject: `Votre devis ASSTSF - Formation ${inscription.formation.title}`,
            html: `
                <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                  <p>${customMessage.replace(/\n/g, '<br>')}</p>
                </div>
            `,
            attachments: [{ filename: `Devis_${numeroDevis}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
        });

    } catch (error: any) {
        console.error("Erreur lors de l'envoi du devis formation :", error);
        return { success: false, error: error.message || "Une erreur est survenue lors de l'envoi." };
    }
}

// ============================================================================
// 2. DPS (Étape 1) : ENVOI DU RIS (FICHE DE DIMENSIONNEMENT)
// ============================================================================

export async function processAndSendDpsRis(
    devisDpsId: string,
    customMessage: string,
    pdfBase64: string
) {
    try {
        const devisDps = await prisma.devisDPS.findUnique({
            where: { id: devisDpsId },
            include: { user: true },
        });

        if (!devisDps) return { success: false, error: "Demande introuvable." };

        const numero = `RIS-${devisDps.id.substring(0, 5).toUpperCase()}`;
        const base64Data = pdfBase64.split("base64,")[1];
        const pdfBuffer = Buffer.from(base64Data, "base64");

        return await sendMail({
            to: devisDps.user.email,
            subject: `📋 Analyse des risques (RIS) - ${devisDps.eventTitle}`,
            html: `
                <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                  <p>${customMessage.replace(/\n/g, '<br>')}</p>
                </div>
            `,
            attachments: [{ filename: `${numero}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
        });
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// 3. DPS (Étape 2) : ENVOI DU CHIFFRAGE (DEVIS FINANCIER)
// ============================================================================

export async function processAndSendDpsChiffrage({
    devisDpsId,
    total,
    customMessage,
    pdfBase64
}: {
    devisDpsId: string;
    total: number;
    customMessage: string;
    pdfBase64: string;
}) {
    try {
        const devisDps = await prisma.devisDPS.findUnique({
            where: { id: devisDpsId },
            include: { user: true },
        });

        if (!devisDps) return { success: false, error: "Demande introuvable." };

        // 🆕 SAUVEGARDE DU MONTANT ET BASCULE AUTOMATIQUE DU STATUT
        await prisma.devisDPS.update({
            where: { id: devisDpsId },
            data: {
                totalMontant: total,
                status: "TRAITE"
            }
        });

        const numero = `CHIFF-${devisDps.id.substring(0, 5).toUpperCase()}`;
        const base64Data = pdfBase64.split("base64,")[1];
        const pdfBuffer = Buffer.from(base64Data, "base64");

        return await sendMail({
            to: devisDps.user.email,
            subject: `🚨 Chiffrage budgétaire - ${devisDps.eventTitle}`,
            html: `
                <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #eee;">
                  <p>${customMessage.replace(/\n/g, '<br>')}</p>
                </div>
            `,
            attachments: [{ filename: `${numero}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
        });
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// 4. DPS (Étape 3) : ENVOI DE LA FACTURE
// ============================================================================

export async function processAndSendDpsFacture({
    devisDpsId,
    total,
    customMessage,
    pdfBase64
}: {
    devisDpsId: string;
    total: number;
    customMessage: string;
    pdfBase64: string;
}) {
    try {
        const devisDps = await prisma.devisDPS.findUnique({
            where: { id: devisDpsId },
            include: { user: true },
        });

        if (!devisDps) return { success: false, error: "Demande introuvable." };

        const numero = `FACT-${devisDps.id.substring(0, 5).toUpperCase()}`;

        // Nettoyage et conversion de la photo en PDF
        const base64Data = pdfBase64.split("base64,")[1];
        const pdfBuffer = Buffer.from(base64Data, "base64");

        return await sendMail({
            to: devisDps.user.email,
            subject: `🧾 Facture ASSTSF n° ${numero} - ${devisDps.eventTitle}`,
            html: `
                <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #eee;">
                  <p>${customMessage.replace(/\n/g, '<br>')}</p>
                </div>
            `,
            attachments: [{ filename: `${numero}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
        });
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// 5. DPS : ENVOI GROUPÉ (RIS + CONVENTION)
// ============================================================================

export async function processAndSendDpsRisAndConv(formData: FormData) {
    try {
        // Déballage sécurisé des données
        const devisDpsId = formData.get("devisId") as string;
        const customMessage = formData.get("message") as string;
        const risPdfBase64 = formData.get("risPdf") as string;
        const convPdfBase64 = formData.get("convPdf") as string;

        if (!devisDpsId || !risPdfBase64 || !convPdfBase64) {
            return { success: false, error: "Données manquantes pour l'envoi." };
        }

        const devisDps = await prisma.devisDPS.findUnique({
            where: { id: devisDpsId },
            include: { user: true },
        });

        if (!devisDps) return { success: false, error: "Demande introuvable." };

        // 🪛 NOUVEAU : MISE À JOUR DU STATUT EN BASE DE DONNÉES
        await prisma.devisDPS.update({
            where: { id: devisDpsId },
            data: {
                status: "TRAITE" // Fait basculer la carte du orange (EN_ATTENTE) au bleu (TRAITE)
            }
        });
        revalidatePath(`/admin/devis-dps/${devisDpsId}`);
        revalidatePath(`/admin/devis-dps`);

        const numeroRis = `RIS-${devisDps.id.substring(0, 5).toUpperCase()}`;
        const numeroConv = `CONV-${devisDps.id.substring(0, 5).toUpperCase()}`;

        // Conversion des Base64 en fichiers
        const risBuffer = Buffer.from(risPdfBase64.split("base64,")[1], "base64");
        const convBuffer = Buffer.from(convPdfBase64.split("base64,")[1], "base64");

        return await sendMail({
            to: devisDps.user.email,
            subject: `📋 Votre Dossier (Analyse RIS & Convention) - ${devisDps.eventTitle}`,
            html: `
                <div style="font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                  <p>${customMessage.replace(/\n/g, '<br>')}</p>
                </div>
            `,
            attachments: [
                { filename: `${numeroRis}.pdf`, content: risBuffer, contentType: "application/pdf" },
                { filename: `${numeroConv}.pdf`, content: convBuffer, contentType: "application/pdf" }
            ],
        });
    } catch (error: any) {
        console.error("Erreur envoi groupé:", error);
        return { success: false, error: error.message };
    }
}
// ============================================================================
// 6. DPS : MISE À JOUR DE LA LOGISTIQUE (ADMIN)
// ============================================================================

export async function updateDpsLogistics(id: string, data: { expectedPublic: number, superficie: string, distanceMaxi: string }) {
    try {
        await prisma.devisDPS.update({
            where: { id },
            data: {
                expectedPublic: data.expectedPublic,
                superficie: data.superficie,
                distanceMaxi: data.distanceMaxi
            }
        });

        // Rafraîchit la page pour recalculer immédiatement le score RIS
        revalidatePath(`/admin/devis-dps/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}