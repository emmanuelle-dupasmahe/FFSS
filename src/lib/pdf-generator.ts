import PDFDocument from "pdfkit";

interface DevisData {
    number: string;
    clientName: string;
    amount: number;
    details: string; // Permet d'écrire le texte spécifique sur le PDF
}

export function generateDevisPdf(data: DevisData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", (err) => reject(err));

        // --- En-tête ---
        doc.fontSize(20).text("PROPOSITION TARIFAIRE / DEVIS", { align: "center" });
        doc.fontSize(12).text("Fédération Française de Sauvetage et de Secourisme", { align: "center" });
        doc.moveDown(2);

        // --- Infos Document ---
        doc.fontSize(11);
        doc.text(`Document Numéro : ${data.number}`);
        doc.text(`Client : ${data.clientName}`);
        doc.text(`Date d'émission : ${new Date().toLocaleDateString("fr-FR")}`);
        doc.moveDown();

        // --- Ligne de séparation ---
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();

        // --- Descriptif Prestation ---
        doc.fontSize(12).text("Désignation des prestations :", { underline: true });
        doc.fontSize(11).text(data.details);
        doc.moveDown(2);

        // --- Prix ---
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(12).text(`Montant Total à régler : ${data.amount.toFixed(2)} €`, { align: "right" });
        doc.fontSize(9).text("TVA non applicable, art. 293 B du CGI", { align: "right" });

        doc.end();
    });
}
