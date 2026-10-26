"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";

export async function updateSystemAlert(content: string, type: string, isActive: boolean) {
    await requireAdmin();
    try {
        await prisma.systemAlert.upsert({
            where: { id: "main-alert" },
            update: { content, type, isActive },
            create: { id: "main-alert", content, type, isActive }
        });

        // On revalide tout le site pour que le bandeau apparaisse ou disparaisse partout instantanément
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error("Erreur lors de la mise à jour du bandeau d'alerte:", error);
        return { success: false, error: error.message };
    }
}