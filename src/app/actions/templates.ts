"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateEmailTemplate(type: string, subject: string, body: string) {
    try {
        await prisma.emailTemplate.upsert({
            where: { type },
            update: { subject, body },
            create: { type, subject, body }
        });

        revalidatePath('/admin/templates');
        return { success: true };
    } catch (error: any) {
        console.error("Erreur lors de la mise à jour du template:", error);
        return { success: false, error: error.message };
    }
}