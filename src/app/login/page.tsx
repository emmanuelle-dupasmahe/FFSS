"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { loginUser } from "@/app/actions/login";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        const result = await loginUser(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else if (result?.success) {
            // le navigateur  recharge la page d'accueil de zéro
            window.location.href = "/";
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-white dark:bg-[#001A3D] transition-colors duration-300">
            <Card className="w-full max-w-md border-t-8 border-t-primary shadow-xl dark:bg-slate-900/50 dark:border-x-slate-800 dark:border-b-slate-800">
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

                    <CardTitle className="text-2xl font-bold text-primary dark:text-blue-400">Espace Membre</CardTitle>
                    <CardDescription className="dark:text-slate-400">
                        Connectez-vous pour accéder à vos formations et ressources.
                    </CardDescription>
                </CardHeader>

                <form action={handleSubmit}>
                    <CardContent className="grid gap-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-200">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nom@exemple.fr"
                                required
                                className="dark:bg-slate-950 dark:border-slate-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Link href="#" className="text-xs text-primary dark:text-blue-400 hover:underline font-medium">
                                    Oublié ?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="dark:bg-slate-950 dark:border-slate-800"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:opacity-90 text-white font-bold mt-2 shadow-md"
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </CardContent>
                </form>

                <CardFooter className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <div className="text-sm text-center text-slate-500 dark:text-slate-400">
                        Pas encore de compte ?{" "}
                        <Link href="/register" className="text-action font-bold hover:underline">
                            S'inscrire ici
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}