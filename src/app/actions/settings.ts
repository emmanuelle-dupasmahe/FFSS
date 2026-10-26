"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";

export async function updateSiteSettings(data: Record<string, string>) {
    await requireAdmin();
    try {
        for (const [key, value] of Object.entries(data)) {
            await prisma.siteContent.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            });
        }
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Erreur updateSiteSettings:", error);
        return { success: false, error: "Erreur lors de la sauvegarde" };
    }
}