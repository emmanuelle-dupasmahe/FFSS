"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/uploadthing";
import { addSiteImage } from "@/app/actions/site";

export default function SiteImageForm() {
    const [imageUrl, setImageUrl] = useState("");

    return (
        <form action={async (formData) => {
            if (!imageUrl) {
                alert("Veuillez d'abord uploader une image !");
                return;
            }
            const category = formData.get("category") as string;
            const label = formData.get("label") as string;

            await addSiteImage(category, imageUrl, label);

            setImageUrl(""); // On vide le champ après succès
            alert("Image enregistrée et publiée avec succès !");
        }} className="space-y-4">

            <select name="category" className="w-full h-12 bg-slate-50 dark:bg-black/20 border border-border rounded-xl px-4 text-foreground text-sm outline-none">
                <option value="CAROUSEL_DPS">Carrousel DPS</option>
                <option value="CAROUSEL_FORMATIONS">Carrousel Formations</option>
            </select>

            <div className="flex gap-2 items-center">
                {/* Champ masqué mais qui envoie la donnée URL lors du submit */}
                <Input
                    name="src"
                    placeholder="L'URL apparaîtra ici après l'upload..."
                    value={imageUrl}
                    readOnly
                    className="bg-slate-50 dark:bg-black/20 border-border h-12 rounded-xl text-foreground flex-grow opacity-70"
                />

                {/* Le bouton d'UploadThing */}
                <div className="shrink-0 bg-white dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 px-2 flex items-center h-12 overflow-hidden shadow-sm">
                    <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(resData) => {
                            if (resData && resData[0]) {
                                setImageUrl(resData[0].url);
                            }
                        }}
                        onUploadError={(error: Error) => {
                            alert(`Erreur : ${error.message}`);
                        }}
                        appearance={{
                            button: "bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase px-3 py-1 rounded w-auto h-auto m-0 shadow-sm",
                            allowedContent: "hidden"
                        }}
                        content={{ button: "Uploader" }}
                    />
                </div>
            </div>

            <Input name="label" placeholder="Légende de l'image" required className="bg-slate-50 dark:bg-black/20 border-border h-12 rounded-xl text-foreground" />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl uppercase font-black tracking-widest text-[10px]">
                Enregistrer l'image
            </Button>
        </form>
    );
}