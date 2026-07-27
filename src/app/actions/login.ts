"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginUser(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false, // 🪛 CRUCIAL : On interdit au serveur de rediriger
    });

    // Si on arrive ici, la connexion a réussi, on renvoie le signal au client
    return { success: true };

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Identifiants invalides." };
        default:
          return { error: "Une erreur est survenue lors de la connexion." };
      }
    }
    // Si une autre erreur inattendue survient
    return { error: "Erreur technique du serveur." };
  }
}