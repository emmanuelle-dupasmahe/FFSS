"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(formData: FormData) {
        setStatus("loading");
        setMessage("");

        const result = await requestPasswordReset(formData);

        if (result.error) {
            setStatus("error");
            setMessage(result.error);
        } else {
            setStatus("success");
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#001A3D] transition-colors duration-300">
            <Card className="w-full max-w-md shadow-xl border-t-8 border-t-blue-600 dark:bg-slate-900/50">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-black uppercase text-slate-900 dark:text-white">
                        Mot de passe oublié
                    </CardTitle>
                    <CardDescription className="dark:text-slate-400">
                        Entrez l'adresse e-mail associée à votre compte pour recevoir un lien de réinitialisation.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {status === "success" ? (
                        <div className="text-center space-y-4 py-6">
                            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <MailCheck className="text-emerald-600 dark:text-emerald-400 w-8 h-8" />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                Si cette adresse existe, un e-mail vient de vous être envoyé avec les instructions pour réinitialiser votre mot de passe.
                            </p>
                            <Button asChild variant="outline" className="mt-4 w-full uppercase tracking-widest text-[10px] font-bold">
                                <Link href="/login">Retour à la connexion</Link>
                            </Button>
                        </div>
                    ) : (
                        <form action={handleSubmit} className="grid gap-6">
                            {status === "error" && (
                                <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-lg text-center font-medium">
                                    {message}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold text-[10px] uppercase tracking-widest text-slate-500">
                                    Adresse e-mail
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="nom@exemple.fr"
                                    required
                                    className="h-12 bg-slate-50 dark:bg-slate-950 font-medium"
                                />
                            </div>

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[10px] h-12 shadow-md transition-all active:scale-95"
                                >
                                    {status === "loading" ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</>
                                    ) : (
                                        "Envoyer le lien"
                                    )}
                                </Button>

                                <Button asChild variant="ghost" className="w-full text-slate-500 hover:text-slate-700">
                                    <Link href="/login" className="flex items-center text-xs">
                                        <ArrowLeft className="w-3 h-3 mr-2" /> Retour à la connexion
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}