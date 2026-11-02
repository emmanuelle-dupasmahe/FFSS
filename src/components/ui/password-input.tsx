"use client";

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
    const [visible, setVisible] = React.useState(false)

    return (
        <div className="relative">
            {/* [&::-ms-reveal]:hidden : évite un 2e œil, celui ajouté par Edge */}
            <Input
                type={visible ? "text" : "password"}
                className={cn("pr-11 [&::-ms-reveal]:hidden", className)}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={visible}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
            >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    )
}

export { PasswordInput }
