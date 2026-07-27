import nodemailer from "nodemailer";

// 1. Création du transporteur avec tes variables d'environnement
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: true, // true car on utilise le port 465
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

// 2. Fonction réutilisable pour envoyer un e-mail
export async function sendMail({
    to,
    subject,
    text,
    html,
    attachments,
}: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: any[];
}) {
    try {
        const info = await transporter.sendMail({
            from: `"ASSTSF" <${process.env.EMAIL_SERVER_USER}>`, // Le nom qui s'affichera chez le destinataire
            to,
            subject,
            text: text || "",
            html: html || "",
            attachments: attachments || [], // C'est ici qu'on glissera les PDF plus tard
        });

        console.log("✅ E-mail envoyé avec succès : %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi de l'e-mail :", error);
        return { success: false, error };
    }
}