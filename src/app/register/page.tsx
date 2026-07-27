"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/register";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Building2, GraduationCap, ClipboardList } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await registerUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/login?success=compte-cree");
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#001A3D] transition-colors duration-300">
      <Card className="w-full max-w-md border-t-8 border-t-primary shadow-2xl dark:bg-slate-900/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="mb-4">
            <div className="flex items-center justify-center">
              <Image
                src="/log_asstsf.png"
                alt="Logo ASSTSF"
                width={100}
                height={100}
                className="object-contain block dark:hidden"
                priority
              />
              <Image
                src="/log_asstsf.png"
                alt="Logo ASSTSF Dark"
                width={100}
                height={100}
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Rejoindre l'<span className="text-primary">ASSTSF</span>
          </CardTitle>
          <CardDescription className="font-medium">
            Choisissez votre profil pour une expérience personnalisée.
          </CardDescription>
        </CardHeader>

        <form action={handleSubmit}>
          <CardContent className="grid gap-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            {/* SÉLECTEUR DE TYPE D'UTILISATEUR */}
            <div className="grid gap-2">
              <Label htmlFor="userType" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Vous êtes ?
              </Label>
              <Select name="userType" defaultValue="PARTICULIER">
                <SelectTrigger className="h-12 border-slate-200 dark:border-white/10 rounded-xl">
                  <SelectValue placeholder="Sélectionnez votre profil" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl rounded-xl">
                  <SelectItem value="PARTICULIER" className="focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer py-3">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-primary" />
                      <span className="font-medium">Un particulier / Candidat</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="STRUCTURE" className="focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer py-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-primary" />
                      <span className="font-medium">Une structure (Lycée, Entreprise...)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ORGANISATEUR" className="focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer py-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={16} className="text-primary" />
                      <span className="font-medium">Un organisateur de DPS</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Nom complet</Label>
              <Input id="name" name="name" placeholder="Jean Dupont" required className="h-12 rounded-xl border-slate-200 dark:border-white/10" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</Label>
              <Input id="email" name="email" type="email" placeholder="nom@exemple.fr" required className="h-12 rounded-xl border-slate-200 dark:border-white/10" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">Mot de passe</Label>
              <Input id="password" name="password" type="password" required className="h-12 rounded-xl border-slate-200 dark:border-white/10" />
            </div>

            <Button
              disabled={loading}
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest py-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2"
            >
              {loading ? "Création du profil..." : "Créer mon compte"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="border-t border-slate-100 dark:border-white/5 pt-6 bg-slate-50/50 dark:bg-white/5 rounded-b-3xl">
          <div className="text-sm text-center w-full text-slate-500">
            Déjà membre de l'ASSTSF ?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}