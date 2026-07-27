import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET : Récupérer les sessions
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const formationId = searchParams.get("formationId");

    const sessions = await prisma.session.findMany({
        where: { formationId: formationId ?? undefined },
        include: {
            _count: {
                select: {
                    inscriptions: {
                        where: {
                            // 🪛 On autorise toutes les orthographes possibles du statut validé
                            status: {
                                in: ["VALIDEE", "VALIDE", "Validée", "Validé", "VALIDÉ", "VALIDÉE"]
                            }
                        }
                    }
                }
            }
        }
    });

    return NextResponse.json(sessions);
}

// POST : Créer une session avec valeurs par défaut
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { formationId, startDate, endDate, details, maxParticipants } = body;

        const session = await prisma.session.create({
            data: {
                formationId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                details: details || null,
                maxParticipants: maxParticipants || 12,
                minParticipants: 6
            }
        });
        return NextResponse.json(session);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
    }
}
