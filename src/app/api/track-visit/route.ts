import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const visitRecord = await prisma.siteContent.findUnique({ where: { key: 'global_visits' } });
        let currentVisits = 0;

        if (visitRecord) {
            currentVisits = parseInt(visitRecord.value, 10) || 0;
        }

        await prisma.siteContent.upsert({
            where: { key: 'global_visits' },
            update: { value: (currentVisits + 1).toString() },
            create: { key: 'global_visits', value: '1' }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}