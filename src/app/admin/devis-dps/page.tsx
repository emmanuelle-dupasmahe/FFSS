import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Eye, Mail, User, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteDevisButton from "@/components/admin/DeleteDevisButton";


export default async function AdminDevisPage() {
    const demandes = await prisma.devisDPS.findMany({
        include: {
            user: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="p-2 md:p-4 space-y-6">
            {/* TITRE */}
            <div>
                <h1 className="text-2xl md:text-3xl font-light italic uppercase tracking-[0.2em] text-white">
                    GESTION DES DEVIS DPS
                </h1>
                <p className="text-[10px] md:text-xs text-primary font-bold tracking-[0.3em] uppercase mt-3">
                    // Consultez et gérez les demandes de dispositifs prévisionnels de secours //
                </p>
            </div>

            {/* CONTENEUR DES CARTES (Responsive Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demandes.map((d) => (
                    <div
                        key={d.id}
                        className="bg-[#001A3D] rounded-3xl border border-white/10 shadow-sm hover:border-primary/50 transition-all group overflow-hidden flex flex-col"
                    >
                        {/* HEADER DE LA CARD */}
                        <div className="p-5 border-b border-white/5 bg-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <Badge
                                    className={`
                                        uppercase text-[9px] font-black tracking-widest px-2 py-1
                                        ${d.status === "EN_ATTENTE" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : ""}
                                        ${d.status === "TRAITE" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}
                                    `}
                                    variant="outline"
                                >
                                    {d.status.replace("_", " ")}
                                </Badge>
                                <Badge variant="outline" className="gap-1 font-bold text-slate-400 border-white/10">
                                    <Users size={10} /> {d.expectedPublic}
                                </Badge>
                            </div>
                            <h2 className="text-lg font-bold text-white leading-tight uppercase tracking-tight">
                                {d.eventTitle}
                            </h2>
                        </div>

                        {/* CONTENU DE LA CARD */}
                        <div className="p-5 space-y-4 flex-grow">
                            {/* Organisateur & Contact */}
                            <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                                {/* Organisme */}
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                    <Building2 size={14} className="text-primary" />
                                    {d.organismeDemandeur || "Organisme non renseigné"}
                                </div>
                                {/* Contact Nom */}
                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                    <User size={12} />
                                    {d.nomContact || d.user?.name || "Anonyme"}
                                </div>
                                {/* Email */}
                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                    <Mail size={12} />
                                    {d.emailContact || d.user?.email}
                                </div>
                            </div>

                            {/* Date et Lieu */}
                            <div className="pt-2 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <Calendar size={14} className="text-primary" />
                                    {new Date(d.eventDate).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <MapPin size={14} className="text-primary" />
                                    {d.location}
                                </div>
                            </div>
                        </div>

                        {/* ACTION DE LA CARD */}
                        <div className="p-4 bg-white/5 border-t border-white/5">
                            <Button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 transition-all font-bold uppercase text-[10px] tracking-widest" asChild>
                                <Link href={`/admin/devis-dps/${d.id}`}>
                                    <Eye className="h-3 w-3 mr-2" />
                                    Voir l'analyse complète
                                </Link>
                            </Button>

                            <DeleteDevisButton id={d.id} />
                        </div>
                    </div>
                ))}

                {/* État vide */}
                {demandes.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl italic text-slate-500">
                        Aucune demande de devis pour le moment.
                    </div>
                )}
            </div>
        </div>
    );
}