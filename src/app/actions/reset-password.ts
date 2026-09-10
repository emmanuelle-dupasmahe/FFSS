"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Veuillez renseigner une adresse e-mail." };
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        // Par sécurité, on renvoie "success" même si l'e-mail n'existe pas.
        // Cela empêche un pirate de deviner si un e-mail est inscrit ou non.
        if (!user) {
            return { success: true };
        }

        // 1. Générer un jeton unique (64 caractères)
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600 * 1000); // Valable 1 heure

        // 2. Nettoyer les anciens jetons et enregistrer le nouveau
        await prisma.passwordResetToken.deleteMany({ where: { email } });
        await prisma.passwordResetToken.create({
            data: { email, token, expires }
        });

        // 3. Préparer le lien de réinitialisation
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${appUrl}/reinitialiser-mot-de-passe?token=${token}`;

        // 4. Configurer Nodemailer avec ton Gmail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD
            }
        });

        // 5. Envoyer l'e-mail
        await transporter.sendMail({
            from: `"ASSTSF" <${process.env.EMAIL_SERVER_USER}>`,
            to: email,
            subject: "🔒 Réinitialisation de votre mot de passe - ASSTSF",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #001A3D; text-transform: uppercase;">Réinitialisation de mot de passe</h2>
                    <p>Bonjour ${user.name || ""},</p>
                    <p>Vous avez demandé à réinitialiser votre mot de passe sur l'espace ASSTSF.</p>
                    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe (ce lien est valable 1 heure) :</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase;">Réinitialiser mon mot de passe</a>
                    </div>
                    <p style="color: #64748b; font-size: 12px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail. Votre compte reste sécurisé.</p>
                </div>
            `
        });

        return { success: true };
    } catch (error) {
        console.error("Erreur lors de la réinitialisation:", error);
        return { error: "Une erreur technique est survenue lors de l'envoi de l'e-mail." };
    }
}


export async function resetPasswordWithToken(formData: FormData) {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token || !password) {
        return { error: "Données manquantes." };
    }

    if (password !== confirmPassword) {
        return { error: "Les mots de passe ne correspondent pas." };
    }

    if (password.length < 8) {
        return { error: "Le mot de passe doit contenir au moins 8 caractères." };
    }

    try {
        // 1. Chercher le jeton dans la base
        const resetRecord = await prisma.passwordResetToken.findFirst({
            where: { token }
        });

        if (!resetRecord) {
            return { error: "Lien invalide ou expiré. Veuillez refaire une demande." };
        }

        // 2. Vérifier si le jeton est expiré
        if (new Date() > resetRecord.expires) {
            await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
            return { error: "Ce lien a expiré (validité : 1 heure). Veuillez refaire une demande." };
        }

        // 3. Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Mettre à jour l'utilisateur
        await prisma.user.update({
            where: { email: resetRecord.email },
            data: { passwordHash: hashedPassword }
        });

        // 5. Supprimer le jeton (il ne peut servir qu'une fois)
        await prisma.passwordResetToken.deleteMany({
            where: { email: resetRecord.email }
        });

        return { success: true };
    } catch (error) {
        console.error("Erreur mise à jour mot de passe:", error);
        return { error: "Une erreur est survenue lors de la modification." };
    }
}