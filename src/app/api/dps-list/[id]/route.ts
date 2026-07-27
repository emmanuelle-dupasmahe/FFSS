import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🟢 FONCTION PATCH (Mise à jour)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // On précise que c'est une Promise
) {
    try {
        // 1. On attend de "déballer" l'ID
        const { id } = await params;

        const body = await req.json();

        const updated = await prisma.catalogueDPS.update({
            where: { id: id },
            data: {
                name: body.name,
                shortName: body.shortName,
                description: body.description,
                icon: body.icon,
                color: body.color,
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Erreur PATCH DPS:", error);
        return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
    }
}

// 🔴 FONCTION DELETE (Suppression)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Idem ici
) {
    try {
        const { id } = await params;

        await prisma.catalogueDPS.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: "Supprimé avec succès" });
    } catch (error: any) {
        console.error("Erreur DELETE DPS:", error);
        return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
    }
}