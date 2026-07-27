"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// 1. Suppression sécurisée (Conservée intacte)
export async function deleteUser(userId: string) {
    const session = await auth();
    
    // Empêcher l'auto-suppression
    if (session?.user?.id === userId) {
        throw new Error("Action impossible : vous ne pouvez pas supprimer votre propre compte.");
    }

    // Vérifier si l'utilisateur à supprimer est un Admin (sécurité supplémentaire)
    const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        include: { userRoles: { include: { role: true } } }
    });

    const isAdmin = userToDelete?.userRoles.some(ur => ur.role.name === "ADMIN");
    if (isAdmin) {
        throw new Error("Action impossible : un administrateur ne peut pas être supprimé via cette interface.");
    }

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
}

// 2. Changement de rôle dynamique (Remplace toggleAdminRole)
export async function toggleUserRole(userId: string, roleName: string, assign: boolean) {
    const session = await auth();

    // Sécurité : empêcher de s'auto-retirer le rôle Admin
    if (session?.user?.id === userId && roleName === "ADMIN" && !assign) {
        throw new Error("Action impossible : vous ne pouvez pas vous retirer vos propres droits d'administrateur.");
    }

    try {
        // A. Chercher ou créer le rôle s'il n'existe pas encore dans la BDD
        let role = await prisma.role.findUnique({
            where: { name: roleName }
        });

        if (!role) {
            role = await prisma.role.create({
                data: { name: roleName }
            });
        }

        // B. Assigner ou retirer le rôle
        if (assign) {
            await prisma.userRole.upsert({
                where: { userId_roleId: { userId: userId, roleId: role.id } },
                create: { userId: userId, roleId: role.id },
                update: {} // Pas besoin de mettre à jour si le lien existe déjà
            });
        } else {
            await prisma.userRole.delete({
                where: { userId_roleId: { userId: userId, roleId: role.id } }
            }).catch(() => {}); // On ignore l'erreur si le rôle n'était déjà pas assigné
        }

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Erreur toggleUserRole:", error);
        throw new Error("Erreur lors de la modification du rôle.");
    }
}