import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-guard";

export async function GET() {
    try {
        const dps = await prisma.catalogueDPS.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(dps);
    } catch (error) {
        console.error("Erreur API DPS:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
export async function POST(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const newDps = await prisma.catalogueDPS.create({
            data: {
                name: body.name,
                shortName: body.shortName,
                description: body.description,
                icon: body.icon,
                color: body.color || 'blue'
            }
        });
        return NextResponse.json(newDps);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
    }
}