"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Check, PenTool } from "lucide-react";

interface SignaturePadProps {
    onSave: (base64Image: string) => void;
    onClear?: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    // Ajuster la résolution du canvas pour éviter le flou sur les écrans Retina/Haute densité
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Récupérer la taille physique affichée par le CSS
        const rect = canvas.getBoundingClientRect();

        // Ajuster la taille interne du canvas au ratio de l'écran
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Mettre à l'échelle le contexte pour que le dessin reste proportionnel
        ctx.scale(dpr, dpr);

        // Configuration du pinceau (style lissé et professionnel)
        ctx.strokeStyle = "#0f172a"; // Couleur de l'encre (slate-900)
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, []);

    // --- FONCTIONS DE DESSIN (SOURIS & TACTILE) ---

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();

        // Gestion du tactile vs souris
        if ("touches" in e) {
            if (e.touches.length === 0) return { x: 0, y: 0 };
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        } else {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault(); // Empêche le défilement de la page sur mobile pendant le dessin
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setIsEmpty(false);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // --- ACTIONS DU PAD ---

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        if (onClear) onClear();
    };

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty) return;

        // Extraction du dessin au format image Base64 PNG transparent
        const base64Image = canvas.toDataURL("image/png");
        onSave(base64Image);
    };

    return (
        <div className="w-full max-w-xl mx-auto space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <PenTool size={14} className="text-primary" />
                Zone de signature électronique
            </div>

            {/* Le cadre de dessin */}
            <div className="relative border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white shadow-inner">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-48 cursor-crosshair touch-none"
                />

                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 dark:text-slate-700 text-xs font-medium select-none uppercase tracking-wider italic">
                        Signez ici avec votre souris ou votre doigt
                    </div>
                )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 justify-end">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={isEmpty}
                    className="rounded-xl text-[10px] font-black uppercase tracking-wider h-9"
                >
                    <Trash2 size={14} className="mr-1.5 text-red-500" /> Effacer
                </Button>

                <Button
                    type="button"
                    size="sm"
                    onClick={handleConfirm}
                    disabled={isEmpty}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider h-9 shadow-md"
                >
                    <Check size={14} className="mr-1.5" /> Valider ma signature
                </Button>
            </div>
        </div>
    );
}