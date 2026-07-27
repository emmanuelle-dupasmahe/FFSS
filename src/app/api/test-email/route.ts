import { NextResponse } from "next/server";

import { sendMail } from "../../../lib/mail"; 

export async function GET() {
  // On appelle notre fonction de service
  const result = await sendMail({
    to: "test.asstsf@gmail.com", // On envoie sur ta boîte de test
    subject: "🚀 Test d'intégration Nodemailer",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #2563eb;">Félicitations Emmanuelle !</h1>
        <p>Si tu lis ce message, c'est que la configuration de <strong>Nodemailer</strong> fonctionne parfaitement avec Next.js et l'adresse Gmail de l'association.</p>
        <p>Prochaine étape : attacher les devis en PDF !</p>
      </div>
    `,
  });

  // On retourne une réponse au navigateur
  if (result.success) {
    return NextResponse.json({ message: "E-mail envoyé avec succès !", details: result });
  } else {
    return NextResponse.json(
      { message: "Erreur lors de l'envoi", error: result.error },
      { status: 500 }
    );
  }
}