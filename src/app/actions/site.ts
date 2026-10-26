"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";

// Pour les textes (Hero, Slogans...)
export async function updateSiteContent(key: string, value: string) {
    await requireAdmin();
    await prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
    revalidatePath("/");
}

// Pour les images des carrousels
export async function addSiteImage(category: string, src: string, label: string) {
    await requireAdmin();
    await prisma.siteImage.create({
        data: { category, src, label }
    });
    revalidatePath("/admin/site");
}

export async function deleteSiteImage(id: string) {
    await requireAdmin();
    await prisma.siteImage.delete({ where: { id } });
    revalidatePath("/admin/site");
}