import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    // On limite l'upload aux PDF de maximum 8 Mo
    pdfUploader: f({ pdf: { maxFileSize: "8MB" } })
        .onUploadComplete(async ({ file }) => {
            console.log("Fichier uploadé avec succès :", file.url);
            return { url: file.url };
        }),

        imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .onUploadComplete(async ({ file }) => {
            console.log("Image uploadée avec succès :", file.url);
            return { url: file.url };
        }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;