import { auth } from "@/auth";

// Le rôle est relu en base à chaque requête (callback jwt de auth.ts) :
// un admin à qui on retire ses droits perd l'accès immédiatement.
export async function isAdmin() {
    const session = await auth();
    return session?.user?.role === "ADMIN";
}

// À appeler en tête de chaque action serveur réservée à l'administration
export async function requireAdmin() {
    if (!(await isAdmin())) {
        throw new Error("Action réservée aux administrateurs.");
    }
}
