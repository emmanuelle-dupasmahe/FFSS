"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUser, toggleUserRole } from "@/app/actions/admin";
import { useTransition } from "react";

export function UserActions({
  userId,
  isAdmin,
  currentRoles = []
}: {
  userId: string,
  isAdmin: boolean,
  currentRoles?: string[]
}) {
  const [isPending, startTransition] = useTransition();

  // 👉 Tu peux ajouter d'autres rôles dans cette liste à l'avenir si besoin !
  const availableRoles = ["BNSSA", "PSC", "PSE1", "PSE2", "SSA", "ADMIN"];
  const missingRoles = availableRoles.filter(r => !currentRoles.includes(r));

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
      startTransition(async () => {
        await deleteUser(userId);
      });
    }
  };

  const handleToggleRole = (roleName: string, isAssigning: boolean) => {
    const actionText = isAssigning ? "ajouter" : "retirer";
    if (confirm(`Voulez-vous vraiment ${actionText} le rôle ${roleName} ?`)) {
      startTransition(async () => {
        await toggleUserRole(userId, roleName, isAssigning);
      });
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Menu : AJOUTER UN RÔLE */}
      {missingRoles.length > 0 && (
        <select
          className="h-9 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer border border-emerald-200 dark:border-emerald-800/50"
          value=""
          onChange={(e) => handleToggleRole(e.target.value, true)}
          disabled={isPending}
        >
          <option value="" disabled>+ Rôle</option>
          {missingRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      )}

      {/* Menu : RETIRER UN RÔLE */}
      {currentRoles.length > 0 && (
        <select
          className="h-9 px-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer border border-orange-200 dark:border-orange-800/50"
          value=""
          onChange={(e) => handleToggleRole(e.target.value, false)}
          disabled={isPending}
        >
          <option value="" disabled>- Rôle</option>
          {currentRoles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      )}

      {/* Bouton Supprimer (Caché si c'est un Admin) */}
      {!isAdmin && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={handleDelete}
          className="h-9 w-9 p-0 rounded-xl hover:bg-red-500 hover:text-white transition-all ml-2 text-slate-400"
        >
          <Trash2 size={16} />
        </Button>
      )}
    </div>
  );
}