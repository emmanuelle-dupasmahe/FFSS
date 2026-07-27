import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: any = {};

        // Champs existants
        if (body.title !== undefined) updateData.title = body.title;
        if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.duration !== undefined) updateData.duration = body.duration;
        if (body.color !== undefined) updateData.color = body.color;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;

        if (body.target !== undefined) {
            updateData.details = { target: body.target };
        }

        // 🪛 AJOUT : On s'assure que le champ Prix s'enregistre correctement
        if (body.price !== undefined) {
            updateData.price = body.price === null ? null : parseFloat(body.price.toString());
        }

        // Ajout des nouveaux champs pédagogiques
        if (body.descriptionDetaillee !== undefined) {
            updateData.descriptionDetaillee = body.descriptionDetaillee;
        }
        if (body.epreuves !== undefined) {
            updateData.epreuves = body.epreuves;
        }

        if (body.ageMin !== undefined) {
            updateData.ageMin = parseInt(body.ageMin.toString(), 10) || 0;
        }

        const updated = await prisma.formation.update({
            where: { id: id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("ERREUR SERVEUR DÉTAILLÉE :", error.message);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour", message: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Utiliser une transaction pour s'assurer que toutes les opérations réussissent ou échouent ensemble
        const deleteTransactions = await prisma.$transaction([
            // 1. Supprimer les paiements liés aux inscriptions de cette formation
            prisma.paiement.deleteMany({ where: { inscription: { formationId: id } } }),
            // 2. Supprimer les inscriptions liées à cette formation
            prisma.inscription.deleteMany({ where: { formationId: id } }),
            // 3. Supprimer les sessions liées à cette formation
            prisma.session.deleteMany({ where: { formationId: id } }),
            // 4. Supprimer les ressources (bien que `onDelete: Cascade` soit présent, c'est une bonne pratique d'être explicite)
            prisma.ressource.deleteMany({ where: { formationId: id } }),
            // 5. Enfin, supprimer la formation elle-même
            prisma.formation.delete({ where: { id } }),
        ]);

        return NextResponse.json({
            message: "Formation et toutes ses données associées ont été supprimées avec succès",
            details: {
                deletedInscriptions: deleteTransactions[1].count,
                deletedSessions: deleteTransactions[2].count,
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Erreur lors de la suppression", message: error.message },
            { status: 500 }
        );
    }
}