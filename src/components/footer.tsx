import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Shield, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Footer() {
    // 🟢 Récupération dynamique des paramètres depuis la BDD
    const contents = await prisma.siteContent.findMany({
        where: { key: { startsWith: 'footer_' } }
    });
    const getVal = (k: string, def: string) => contents.find(c => c.key === k)?.value || def;

    const footerTitle = getVal('footer_title', 'ASSTSF - Association des Secouristes de la Seyne Tamaris Six Fours');
    const footerSub = getVal('footer_subtitle', 'Affiliée à la FFSS // Agréée de Sécurité Civile.');
    const footerAddress = getVal('footer_address', '98 Rue Fontaine, 83500 La Seyne sur Mer');
    const footerEmail = getVal('footer_email', 'asst.laseyne@gmail.com');
    const footerPhone = getVal('footer_phone', '');

    return (
        <footer className="w-full bg-white dark:bg-[#001A3D] border-t border-slate-200 dark:border-white/10 pt-12 pb-6 px-6 mt-auto transition-colors">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* Colonne 1 : Identité & Partenaires */}
                <div className="space-y-6">
                    <div className="flex items-center gap-5">
                        <Link href="/" className="relative group">
                            <div className="relative w-12 h-12 animate-pulse transition-all duration-500 group-hover:scale-110">
                                <Image
                                    src="/log_asstsf.png"
                                    alt="Logo ASSTSF"
                                    fill
                                    sizes="48px"
                                    className="object-contain drop-shadow-[0_0_5px_rgba(0,102,204,0.3)] group-hover:drop-shadow-[0_0_10px_rgba(0,102,204,0.5)]"
                                    priority
                                />
                            </div>
                        </Link>

                        <div className="flex gap-4 border-l border-slate-200 dark:border-white/10 pl-5 h-12 items-center">
                            <PartnerLogo src="/logo_ffss.png" alt="FFSS" href="https://www.ffss.fr" />
                            <PartnerLogo src="/securite-civile.png" darkSrc="/securite-civile_dark.png" alt="SC" href="https://www.protection-civile.org" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {footerTitle}
                        </h2>
                        <p className="text-[9px] text-primary font-bold uppercase tracking-[0.2em]">VAR</p>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs font-light italic opacity-80">
                        {footerSub}
                    </p>
                </div>

                {/* Colonne 2 : Contact */}
                <div className="space-y-5">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b border-primary/20 pb-1.5 w-fit">
                        Contact
                    </h3>
                    <ul className="space-y-3 text-xs">
                        <li className="flex items-start gap-3 group">
                            <MapPin size={14} className="text-primary mt-0.5 opacity-70" />
                            <span className="text-slate-600 dark:text-slate-400 font-light">
                                {footerAddress}
                            </span>
                        </li>
                        <li className="flex items-center gap-3 group">
                            <Mail size={14} className="text-primary opacity-70" />
                            <a href={`mailto:${footerEmail}`} className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                                {footerEmail}
                            </a>
                        </li>
                        {footerPhone && (
                            <li className="flex items-center gap-3 group">
                                <Phone size={14} className="text-primary opacity-70" />
                                <a href={`tel:${footerPhone.replace(/\s+/g, '')}`} className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                                    {footerPhone}
                                </a>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Colonne 3 : Services */}
                <div className="space-y-5">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b border-primary/20 pb-1.5 w-fit">
                        Services
                    </h3>
                    <div className="flex flex-col gap-3">
                        {/* Bouton DPS : Outline en Light, Plein en Dark */}
                        <Button asChild size="sm" className="bg-transparent dark:bg-primary border border-primary text-primary dark:text-white hover:bg-primary hover:text-white font-bold uppercase tracking-widest text-[9px] h-10 shadow-sm transition-all hover:-translate-y-0.5">
                            <Link href="/dps/nouvelle-demande">
                                <Shield size={12} className="mr-2" /> Demande de DPS
                            </Link>
                        </Button>

                        {/* Bouton Formation : Outline en Light, Plein en Dark */}
                        <Button asChild size="sm" className="bg-transparent dark:bg-formation border border-formation text-formation-foreground dark:text-formation-foreground hover:bg-formation hover:text-formation-foreground font-bold uppercase tracking-widest text-[9px] h-10 shadow-sm transition-all hover:-translate-y-0.5">
                            <Link href="/formations/devis">
                                <GraduationCap size={12} className="mr-2" /> Demande de Formation
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                    © {new Date().getFullYear()} ASSTSF
                </p>
                <div className="flex gap-5 text-[9px] text-slate-400 uppercase tracking-widest">
                    <Link href="/mentions-legales" className="hover:text-primary transition-colors">Mentions Légales</Link>
                    <Link href="/confidentialite" className="hover:text-primary transition-colors">RGPD</Link>
                </div>
            </div>
        </footer>
    );
}

function PartnerLogo({ src, darkSrc, alt, href }: { src: string, darkSrc?: string, alt: string, href: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-12 h-12 transition-all duration-500 hover:scale-110"
        >
            <Image
                src={src}
                alt={alt}
                fill
                sizes="48px"
                className={`object-contain ${darkSrc ? 'dark:hidden' : ''}`}
            />
            {darkSrc && (
                <Image
                    src={darkSrc}
                    alt={alt}
                    fill
                    sizes="48px"
                    className="object-contain hidden dark:block"
                />
            )}
        </a>
    );

}