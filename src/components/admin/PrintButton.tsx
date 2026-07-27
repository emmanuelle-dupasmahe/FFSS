"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <Button 
      onClick={() => window.print()} 
      variant="outline" 
      className="rounded-full gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all print:hidden"
    >
      <Printer size={18} /> Exporter en PDF
    </Button>
  );
}