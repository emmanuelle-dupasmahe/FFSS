"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const rawUserType = formData.get("userType") as string;

  const allowedTypes = ["PARTICULIER", "STRUCTURE", "ORGANISATEUR"];
  const userType = allowedTypes.includes(rawUserType) ? rawUserType : "PARTICULIER";

  if (!email || !password) return { error: "Champs requis manquants" };

  // Hachage du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        userType,
        // assigne le rôle USER par défaut 
        userRoles: {
          create: {
            role: { connect: { name: 'USER' } }
          }
        }
      },
    });
    return { success: true };
  } catch (error: any) {
    console.log(error);

    // 🪛 NOUVEAU : Interception spécifique de l'erreur Prisma P2002 (e-mail en doublon)
    if (error.code === 'P2002') {
      return { error: "Cette adresse e-mail est déjà utilisée." };
    }

    return { error: "Une erreur est survenue lors de l'inscription." };
  }
}