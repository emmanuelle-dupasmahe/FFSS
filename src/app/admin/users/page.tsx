import { prisma } from "@/lib/prisma";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  UserPlus,
  Fingerprint,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { redirect } from "next/navigation";
// Importation du nouveau composant client pour l'interactivité
import { UserActions } from "@/components/admin/UserActions";

export default async function UsersAdminPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  // 1. Récupération des utilisateurs avec filtre
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: { userRoles: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });

  // 2. Logique de recherche (Server Action)
  async function handleSearch(formData: FormData) {
    "use server";
    const searchTerm = formData.get("search") as string;
    if (searchTerm) {
      redirect(`/admin/users?q=${searchTerm}`);
    } else {
      redirect("/admin/users");
    }
  }

  return (
    <div className="space-y-12 pb-10">

      {/* HEADER & ACTIONS */}
      <div className="flex flex-col gap-8 border-b border-slate-200 dark:border-white/10 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-slate-900 dark:text-white">
              Gestion des Membres
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                {users.length} Utilisateurs trouvés
              </p>
            </div>
          </div>

          <Button className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] py-6 px-8 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 rounded-2xl">
            <UserPlus size={16} className="mr-2" />
            Nouveau Membre
          </Button>
        </div>

        {/* BARRE DE RECHERCHE */}
        <form action={handleSearch} className="relative max-w-md group">
          <Input
            name="search"
            placeholder="Rechercher un nom ou un email..."
            defaultValue={query}
            className="pl-12 h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl focus:ring-primary focus:border-primary transition-all group-hover:border-primary/50"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" size={20} />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl text-[10px] uppercase font-black tracking-widest px-4">
            Filtrer
          </Button>
        </form>
      </div>

      {/* GRILLE DE PROFILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
            <p className="text-slate-400 italic font-light tracking-wide">Aucun membre ne correspond à votre recherche "{query}"</p>
            <Button asChild variant="link" className="text-primary font-bold uppercase text-[10px] tracking-widest">
              <Link href="/admin/users">Effacer la recherche</Link>
            </Button>
          </div>
        ) : (
          users.map((user) => {
            const isAdmin = user.userRoles.some(ur => ur.role.name === "ADMIN");

            return (
              <div
                key={user.id}
                className={`group bg-white dark:bg-white/5 rounded-3xl border transition-all duration-500 hover:shadow-2xl ${isAdmin
                  ? "border-primary/40 shadow-lg shadow-primary/5"
                  : "border-slate-200 dark:border-white/10 hover:border-primary/30"
                  }`}
              >
                {/* Header Carte Profil */}
                <div className="p-6 pb-0 flex justify-between items-start">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm transition-colors duration-500 ${isAdmin
                      ? "bg-primary text-white"
                      : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white group-hover:bg-primary group-hover:text-white"
                      }`}>
                      {user.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    {isAdmin && (
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-lg shadow-lg">
                        <Shield size={12} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md ${isAdmin ? "bg-primary text-white" : "bg-primary/10 text-primary"
                      }`}>
                      {user.userType || "PARTICULIER"}
                    </span>
                    {/* Le composant <Link> avec <ExternalLink /> causant l'erreur 404 a été retiré */}
                  </div>
                </div>

                {/* Corps du Profil */}
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors truncate">
                      {user.name || "Utilisateur Anonyme"}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                      <Fingerprint size={12} />
                      <p className="text-[9px] font-mono uppercase tracking-tighter">ID-{user.id.slice(-8)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {user.userRoles.map((ur) => (
                      <span
                        key={ur.roleId}
                        className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-transparent"
                      >
                        {ur.role.name}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 group/link">
                      <Mail size={14} className="text-primary opacity-50 group-hover/link:opacity-100 transition-opacity" />
                      <span className="truncate font-light">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <Phone size={14} className="text-primary opacity-50" />
                        <span className="font-light">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ FOOTER D'ACTIONS : Utilise le composant client UserActions */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center rounded-b-3xl">
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    <Calendar size={12} className="text-primary" />
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  </div>

                  <UserActions
                    userId={user.id}
                    isAdmin={isAdmin}
                    currentRoles={user.userRoles.map((ur) => ur.role.name)}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}