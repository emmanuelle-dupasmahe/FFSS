import { prisma } from "@/lib/prisma";
import { Image as ImageIcon, Type, Trash2, Plus, Save, Layout, RefreshCw, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addSiteImage, deleteSiteImage, updateSiteContent } from "@/app/actions/site";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SiteImageForm from "@/components/admin/SiteImageForm";

export default async function SiteAdminPage() {
    const images = await prisma.siteImage.findMany({ orderBy: { createdAt: 'desc' } });
    const contents = await prisma.siteContent.findMany();

    const getContent = (key: string) => contents.find(c => c.key === key)?.value || "";

    return (
        <div className="space-y-10 pb-20">
            {/* HEADER ADAPTÉ */}
            <div className="border-b border-border pb-8">
                <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-foreground">
                    Gestion <span className="text-primary font-black italic">Contenu Site</span>
                </h2>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold opacity-80">
                    Configurez les visuels et les textes sans toucher au code.
                </p>
            </div>

            <Tabs defaultValue="images" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-white/5 border border-border p-1 rounded-xl mb-8">
                    <TabsTrigger value="images" className="data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] uppercase font-black tracking-widest">
                        Images Carrousels
                    </TabsTrigger>
                    <TabsTrigger value="texts" className="data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] uppercase font-black tracking-widest">
                        Textes & Titres
                    </TabsTrigger>
                </TabsList>

                {/* 🖼️ GESTION DES IMAGES */}
                <TabsContent value="images" className="space-y-12">
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Formulaire d'ajout adapté */}
                        <div className="bg-card border border-border rounded-[2rem] p-8 space-y-6 shadow-sm">
                            <h3 className="flex items-center gap-3 text-foreground font-black uppercase text-xs tracking-widest">
                                <Plus size={16} className="text-primary" /> Ajouter une image
                            </h3>
                            <div className="bg-card border border-border rounded-[2rem] p-8 space-y-6 shadow-sm">
                                <h3 className="flex items-center gap-3 text-foreground font-black uppercase text-xs tracking-widest">
                                    <Plus size={16} className="text-primary" /> Ajouter une image
                                </h3>

                                <SiteImageForm />

                            </div>
                        </div>

                        {/* Liste des images existantes */}
                        <div className="space-y-4">
                            <h3 className="text-slate-500 font-black uppercase text-[10px] tracking-widest pl-4">Images en ligne</h3>
                            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
                                {images.map((img) => (
                                    <div key={img.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl group transition-all hover:border-primary/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black overflow-hidden border border-border">
                                                <img src={img.src} alt="" className="object-cover w-full h-full" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground uppercase">{img.label}</p>
                                                <p className="text-[9px] text-slate-500 uppercase tracking-tighter">{img.category}</p>
                                            </div>
                                        </div>
                                        <form action={async () => { "use server"; await deleteSiteImage(img.id); }}>
                                            <Button type="submit" variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </Button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </TabsContent>

                {/* ✍️ GESTION DES TEXTES */}
                <TabsContent value="texts" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <TextEditCard title="Hero Formations - Titre" id="formations_hero_title" defaultValue={getContent("formations_hero_title")} />
                        <TextEditCard title="Hero Formations - Sous-titre" id="formations_hero_subtitle" defaultValue={getContent("formations_hero_subtitle")} isTextArea />
                        <TextEditCard title="Hero DPS - Titre" id="dps_hero_title" defaultValue={getContent("dps_hero_title")} />
                        <TextEditCard title="Hero DPS - Sous-titre" id="dps_hero_subtitle" defaultValue={getContent("dps_hero_subtitle")} isTextArea />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TextEditCard({ title, id, defaultValue, isTextArea }: { title: string, id: string, defaultValue: string, isTextArea?: boolean }) {
    return (
        <div className="bg-card border border-border rounded-[2rem] p-8 space-y-4 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{title}</h4>
            <form action={async (formData) => {
                "use server";
                const val = formData.get("content") as string;
                await updateSiteContent(id, val);
            }} className="space-y-4">
                {isTextArea ? (
                    <Textarea name="content" defaultValue={defaultValue} className="bg-slate-50 dark:bg-black/20 border-border rounded-xl min-h-[100px] text-sm text-foreground" />
                ) : (
                    <Input name="content" defaultValue={defaultValue} className="bg-slate-50 dark:bg-black/20 border-border h-12 rounded-xl text-sm text-foreground" />
                )}
                <Button type="submit" className="bg-slate-100 dark:bg-white/10 hover:bg-primary text-foreground dark:text-white dark:hover:text-white font-black uppercase tracking-widest text-[9px] w-full rounded-xl transition-colors">
                    <Save size={14} className="mr-2" /> Mettre à jour
                </Button>
            </form>
        </div>
    );
}