import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // 1. On déclare params comme une Promise
) {
    try {
        const resolvedParams = await params; // 2. On "attend" que les paramètres soient prêts
        const id = resolvedParams.id;

        // On demande à Prisma de supprimer la session qui correspond à cet ID
        await prisma.session.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json({ message: "Session supprimée avec succès" }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la suppression de la session:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression" },
            { status: 500 }
        );
    }
}
// PATCH : Modifier une session existante
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        // On récupère les nouvelles données envoyées par le frontend
        const body = await req.json();
        const { startDate, endDate, details, maxParticipants } = body;

        // On met à jour la session dans la base de données
        const updatedSession = await prisma.session.update({
            where: {
                id: id,
            },
            data: {
                // On met à jour uniquement si la donnée est fournie
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(details !== undefined && { details: details || null }),
                ...(maxParticipants && { maxParticipants: Number(maxParticipants) })
            },
        });

        return NextResponse.json(updatedSession, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la modification de la session:", error);
        return NextResponse.json(
            { error: "Erreur lors de la modification" },
            { status: 500 }
        );
    }
}