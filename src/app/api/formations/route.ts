import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newFormation = await prisma.formation.create({
      data: {
        // On s'assure qu'aucun champ obligatoire n'est undefined
        title: body.title || "NOUVELLE FORMATION",
        subtitle: "Sous-titre à définir",
        description: "Description à remplir",
        duration: "7h // Annuelle",
        price: 0,           // Ajoute ceci si le prix est obligatoire dans ton schéma
        ageMin: 16,
        descriptionDetaillee: "",
        epreuves: "",
        color: "bg-blue-600",
        isActive: false,
        slug: `new-formation-${Date.now()}`, // Génère un slug unique au cas où il soit requis
      }
    });

    return NextResponse.json(newFormation);
  } catch (error: any) {
    console.error("DÉTAIL ERREUR PRISMA:", error); // Regarde ton terminal VS Code après le clic
    return NextResponse.json(
      { error: "Erreur base de données", details: error.message },
      { status: 500 }
    );
  }
}