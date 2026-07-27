import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔵 GET : Pour lire tous les textes (Titre, délais, citation, etc.)
export async function GET() {
  try {
    const content = await prisma.siteContent.findMany();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de lecture" }, { status: 500 });
  }
}

// 🟢 POST : Pour créer ou mettre à jour un texte
export async function POST(req: Request) {
  try {
    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json({ error: "Clé manquante" }, { status: 400 });
    }

    // "upsert" signifie : si ça existe, on met à jour (update), sinon on crée (create)
    const updatedContent = await prisma.siteContent.upsert({
      where: { key: key },
      update: { value: value },
      create: {
        key: key,
        value: value,
      },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Erreur API SiteContent:", error);
    return NextResponse.json({ error: "Erreur d'enregistrement" }, { status: 500 });
  }
}