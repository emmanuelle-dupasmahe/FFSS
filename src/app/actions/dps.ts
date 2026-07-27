"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const RIS_MAPPING: Record<string, number> = {
  "Calme": 0.25, "Peu dynamique": 0.30, "Dynamique": 0.35, "Très dynamique": 0.40,
  "Facile": 0.25, "Intermédiaire": 0.30, "Difficile": 0.35, "Complexe": 0.40,
  "Moins de 10 minutes": 0.25, "10-20 minutes": 0.30, "20-30 minutes": 0.35, "Plus de 30 minutes": 0.40
};

export async function createDevisDPS(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Vous devez être connecté pour soumettre une demande." };
  }

  // Extraction des données avec vérification
  const title = formData.get("title") as string;
  const dateDebut = formData.get("dateDebut") as string;
  const heureDebut = formData.get("heureDebut") as string;
  const dateFin = formData.get("dateFin") as string;
  const heureFin = formData.get("heureFin") as string;
  const location = formData.get("location") as string;
  const publicAttendu = formData.get("public") as string;
  const description = formData.get("description") as string;
  const ambiance = formData.get("ambiance") as string;
  const accessibilite = formData.get("accessibilite") as string;
  const delaiSecours = formData.get("delaiSecours") as string;

  //  Coordonnées de l'organisateur
  const organismeDemandeur = formData.get("organismeDemandeur") as string;
  const nomContact = formData.get("nomContact") as string;
  const telephoneContact = formData.get("telephoneContact") as string;
  const emailContact = formData.get("emailContact") as string;

  const superficie = formData.get("superficie") as string;
  const distanceMaxi = formData.get("distanceMaxi") as string;
  const fournitLocal = formData.get("fournitLocal") === "on"; // "on" est la valeur envoyée par une Checkbox cochée

  try {
    const devis = await prisma.devisDPS.create({
      data: {
        // Coordonnées
        organismeDemandeur: organismeDemandeur,
        nomContact: nomContact,
        telephoneContact: telephoneContact,
        emailContact: emailContact,

        // Logistique
        superficie: superficie,
        distanceMaxi: distanceMaxi,
        fournitLocal: fournitLocal,

        // Infos Événement
        eventTitle: title,
        eventDate: new Date(dateDebut),
        endDate: dateFin ? new Date(dateFin) : null,
        startTime: heureDebut,
        endTime: heureFin,
        location: location,
        expectedPublic: parseInt(publicAttendu) || 0,
        description: description,
        userId: session.user.id,
        status: "EN_ATTENTE",

        // Risques et calculs
        ambiance: ambiance,
        accessibilite: accessibilite,
        delaiSecours: delaiSecours,
        p2: RIS_MAPPING[ambiance] || 0.25,
        e1: RIS_MAPPING[accessibilite] || 0.25,
        e2: RIS_MAPPING[delaiSecours] || 0.25,
      },
    });

    revalidatePath("/admin/devis-dps");
    return { success: true, id: devis.id };

  } catch (error: any) {
    // Cela affichera l'erreur précise dans votre terminal VS Code
    console.error("DÉTAIL ERREUR PRISMA:", error.message);
    return { error: `Erreur technique : ${error.message}` };
  }
}

export async function updateDevisIndicators(id: string, data: Partial<{ p2: number, e1: number, e2: number }>) {
  await prisma.devisDPS.update({
    where: { id },
    data: data,
  });
  revalidatePath(`/admin/devis-dps/${id}`);
}

export async function deleteDevisDPS(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Vous devez être connecté pour effectuer cette action." };
  }

  try {
    await prisma.devisDPS.delete({
      where: { id },
    });

    // On rafraîchit la liste du dashboard automatiquement
    revalidatePath("/admin/devis-dps");
    return { success: true };

  } catch (error: any) {
    console.error("ERREUR SUPPRESSION DPS:", error.message);
    return { error: `Erreur lors de la suppression : ${error.message}` };
  }
}