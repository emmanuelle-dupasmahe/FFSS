import { prisma } from "@/lib/prisma";
import { AlertCircle, Info, CheckCircle } from "lucide-react";

export default async function TopAlertBanner() {
    const alert = await prisma.systemAlert.findUnique({
        where: { id: "main-alert" }
    });

    // Si le bandeau n'est pas actif ou n'a pas de contenu, on n'affiche rien du tout !
    if (!alert || !alert.isActive || !alert.content) return null;

    // Détermination des styles selon le type
    let bgStyle = "bg-yellow-400 text-slate-950";
    let Icon = Info;
    let pulseStyle = "animate-pulse-subtle"; 

    if (alert.type === "warning") {
        bgStyle = "bg-red-500 text-slate-950";
        Icon = AlertCircle;
        pulseStyle = "animate-pulse-warning";
    } else if (alert.type === "success") {
        bgStyle = "bg-emerald-500 text-white";
        Icon = CheckCircle;
    }

    return (
        <>
            {/* 👇 pour indiquer à la Navbar que le bandeau est présent 👇 */}
            <style dangerouslySetInnerHTML={{
                __html: `
                html { --banner-height: 44px; }
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.85; transform: scale(1.005); }
                }
                @keyframes pulse-warning {
                    0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(253, 224, 71, 0.8); }
                    50% { opacity: 0.95; transform: scale(1.008); box-shadow: 0 0 15px 6px rgba(253, 224, 71, 0); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s infinite ease-in-out;
                }
                .animate-pulse-warning {
                    animation: pulse-warning 2s infinite ease-in-out;
                }
                /* Injection de la règle pour la navbar lorsque le bandeau est actif */
                nav.sticky {
                    top: 44px !important;
                }
            `}} />

            {/* 👇 Le bandeau reste en sticky top-0 h-[44px] 👇 */}
            <div className={`w-full h-[44px] ${bgStyle} ${pulseStyle} px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-inner transition-all duration-300 sticky top-0 z-[10000]`}>
                <Icon size={14} className="shrink-0" />
                <span className="leading-tight">{alert.content}</span>
            </div>
        </>
    );
}