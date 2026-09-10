"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordWithToken } from "@/app/actions/reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(formData: FormData) {
        setStatus("loading");
        setMessage("");
        formData.append("token", token || "");

        const result = await resetPasswordWithToken(formData);

        if (result.error) {
            setStatus("error");
            setMessage(result.error);
        } else {
            setStatus("success");
        }
    }

    if (!token) {
        return (
            <div className="text-center p-6 space-y-4">
                <p className="text-red-500 font-bold">Lien invalide ou manquant.</p>
                <Button asChild variant="outline">
                    <Link href="/mot-de-passe-oublie">Refaire une demande</Link>
                </Button>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="text-center space-y-6 py-8">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mot de passe modifié !</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Votre nouveau mot de passe est désormais actif.
                    </p>
                </div>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[10px] h-12 shadow-md">
                    <Link href="/login">Me connecter</Link>
                </Button>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="grid gap-6">
            {status === "error" && (
                <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-3 rounded-lg text-center font-medium">
                    {message}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password" className="font-bold text-[10px] uppercase tracking-widest text-slate-500">
                        Nouveau mot de passe
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        className="h-12 bg-slate-50 dark:bg-slate-950 font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-bold text-[10px] uppercase tracking-widest text-slate-500">
                        Confirmer le mot de passe
                    </Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        className="h-12 bg-slate-50 dark:bg-slate-950 font-medium"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] h-12 shadow-md transition-all active:scale-95"
            >
                {status === "loading" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
                ) : (
                    "Valider mon nouveau mot de passe"
                )}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#001A3D] transition-colors duration-300">
            <Card className="w-full max-w-md shadow-xl border-t-8 border-t-emerald-600 dark:bg-slate-900/50">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-black uppercase text-slate-900 dark:text-white">
                        Nouveau mot de passe
                    </CardTitle>
                    <CardDescription className="dark:text-slate-400">
                        Saisissez un nouveau mot de passe.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="text-center p-4"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}