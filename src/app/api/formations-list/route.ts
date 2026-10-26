import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";

export async function GET() {
  try {
    // 🔒 Les inscrits (données personnelles) ne sont envoyés qu'aux administrateurs :
    // cette route est aussi appelée par les pages publiques /formations
    const admin = await isAdmin();

    const formations = await prisma.formation.findMany({
      // 👇 POUR RÉCUPÉRER LES DOCUMENTS ET LES SESSIONS
      include: {
        ressources: true,
        sessions: {
          orderBy: {
            startDate: 'asc' // 🟢 Trie les dates 
          }
        },
        inscriptions: admin && {
          include: {
            // Uniquement le nom, l'email et le téléphone (jamais le mot de passe)
            user: { select: { name: true, email: true, phone: true } }
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