import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookOpen, FileText, ExternalLink, PlayCircle, Download } from "lucide-react";
import { auth } from "@/auth";
import SectionHeader from "@/components/SectionHeader";

export default async function EspaceStagiairePage() {
    // 1. Récupération de l'utilisateur connecté
    const session = await auth();

    if (!session?.user?.id) redirect("/login");
    const user = session.user;

    // 2. On récupère les inscriptions VALIDÉES du stagiaire
    const inscriptions = await prisma.inscription.findMany({
        where: {
            userId: user.id,
            status: "VALIDE" // Ne montre les cours que si le dossier est validé
        },
        include: {
            formation: {
                include: { ressources: true } // On inclut les documents !
            }
        }
    });

    // 3. On récupère les rôles de l'utilisateur (s'il a le rôle BNSSA par ex)
    const userRoles = await prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true }
    });
    const roleNames = userRoles.map(ur => ur.role.name);

    // 4. On récupère aussi les formations liées à ses rôles (Bonus)
    // S'il a le rôle "PSE1", on lui montre les ressources de la formation PSE1
    const formationsParRole = await prisma.formation.findMany({
        where: {
            // On cherche si le titre de la formation correspond à l'un de ses rôles
            OR: roleNames.map(role => ({ title: { contains: role, mode: 'insensitive' } }))
        },
        include: { ressources: true }
    });

    // Fusionner les formations (Inscriptions + Rôles) sans doublons
    const allFormations = [...inscriptions.map(i => i.formation), ...formationsParRole];
    const formationsUniques = Array.from(new Map(allFormations.map(f => [f.id, f])).values());

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#001A3D] p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                <div>
                    <SectionHeader
                        title="Mon Espace de Formation"
                        subtitle={`Bienvenue ${user.name || ""}`}
                        className="!mb-6"
                    />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Retrouvez ici tous vos documents pédagogiques.</p>
                </div>

                {formationsUniques.length === 0 ? (
                    <div className="bg-white dark:bg-white/5 p-12 text-center rounded-[2.5rem] border border-slate-200 dark:border-white/10">
                        <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                        <h2 className="text-xl font-bold text-slate-500">Aucune formation active</h2>
                        <p className="text-slate-400 mt-2">Votre dossier est peut-être en cours de validation par l'équipe ASSTSF.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {formationsUniques.map((formation) => (
                            <div key={formation.id} className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 shadow-sm">
                                <h2 className="text-xl font-black uppercase italic text-slate-900 dark:text-white mb-6 border-l-4 border-blue-600 pl-4">
                                    {formation.title}
                                </h2>

                                <div className="space-y-4">
                                    {formation.ressources.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">Aucun document pour le moment.</p>
                                    ) : (
                                        formation.ressources.map((res) => (
                                            <a
                                                key={res.id}
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-2xl hover:bg-blue-50 hover:dark:bg-blue-900/20 transition-colors group border border-slate-100 dark:border-white/5"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {res.type === "PDF" ? <FileText className="text-red-500" size={20} /> :
                                                        res.type === "VIDEO" ? <PlayCircle className="text-blue-500" size={20} /> :
                                                            <ExternalLink className="text-emerald-500" size={20} />}
                                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-blue-600">{res.title}</span>
                                                </div>
                                                <Download size={16} className="text-slate-400 group-hover:text-blue-600" />
                                            </a>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}