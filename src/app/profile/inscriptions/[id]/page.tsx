import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import SignInscriptionClient from "@/components/profile/SignInscriptionClient";

export const dynamic = "force-dynamic";

export default async function SignInscriptionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session || !session.user?.email) {
        redirect("/login");
    }

    const resolvedParams = await params;
    const inscriptionId = resolvedParams.id;

    const inscription = await prisma.inscription.findUnique({
        where: { id: inscriptionId },
        include: {
            formation: true,
            user: true
        }
    });

    if (!inscription || inscription.user.email !== session.user.email) {
        redirect("/profile");
    }

    

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16">
            <Link href="/profile" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-primary transition-colors">
                <ArrowLeft size={16} /> Retour à mon espace
            </Link>

            <div className="border-b border-border pb-6">
                <h2 className="text-2xl font-light uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
                    <GraduationCap className="text-primary" size={28} />
                    Validation du <span className="text-primary font-black italic">Dossier</span>
                </h2>
                <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest opacity-80">
                    Session : {inscription.formation.title}
                </p>
            </div>

            <SignInscriptionClient inscription={inscription} />
        </div>
    );
}