import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { isAdmin } from "@/lib/admin-guard";

const f = createUploadthing();

// 🔒 Les uploads (ressources PDF, images du site) sont réservés aux administrateurs
const adminOnly = async () => {
    if (!(await isAdmin())) throw new UploadThingError("Non autorisé");
    return {};
};

export const ourFileRouter = {
    // On limite l'upload aux PDF de maximum 8 Mo
    pdfUploader: f({ pdf: { maxFileSize: "8MB" } })
        .middleware(adminOnly)
        .onUploadComplete(async ({ file }) => {
            console.log("Fichier uploadé avec succès :", file.url);
            return { url: file.url };
        }),

        imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(adminOnly)
        .onUploadComplete(async ({ file }) => {
            console.log("Image uploadée avec succès :", file.url);
            return { url: file.url };
        }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;