"use client";

import { useEffect } from "react";

export default function VisitTracker() {
    useEffect(() => {
        // On vérifie si l'utilisateur a déjà été compté pendant cette session de navigation
        if (!sessionStorage.getItem("asstsf_visited")) {
            fetch("/api/track-visit", { method: "POST" })
                .then((res) => {
                    if (res.ok) {
                        sessionStorage.setItem("asstsf_visited", "true");
                    }
                })
                .catch(console.error);
        }
    }, []);

    return null; // Ce composant est 100% invisible sur le site !
}