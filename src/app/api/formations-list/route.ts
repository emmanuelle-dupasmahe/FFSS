import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const formations = await prisma.formation.findMany({
      // 👇 POUR RÉCUPÉRER LES DOCUMENTS ET LES SESSIONS
      include: {
        ressources: true,
        sessions: {
          orderBy: {
            startDate: 'asc' // 🟢 Trie les dates 
          }
        },
        inscriptions: {
          include: {
            user: true // Permet de récupérer le nom, l'email et le téléphone
          }
        }
      },

      orderBy: {
        createdAt: 'desc' // 🟢 On met les plus récentes en haut
      }
    });

    return NextResponse.json(formations);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}