import React from 'react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

export default function SectionHeader({ title, subtitle, className = "" }: SectionHeaderProps) {
    return (
        <div className={`flex flex-col space-y-4 mb-16 ${className}`}>
            <h1 className="text-3xl md:text-4xl font-light uppercase tracking-[0.2em] leading-tight text-slate-900 dark:text-white">
                {title}
            </h1>
            {subtitle && (
                <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
                    <span className="opacity-30 font-light text-xl tracking-tighter">//</span>
                    <span>{subtitle}</span>
                    <span className="opacity-30 font-light text-xl tracking-tighter">//</span>
                </div>
            )}
            <div className="h-[1px] w-12 bg-primary/40 mt-2"></div>
        </div>
    );
}