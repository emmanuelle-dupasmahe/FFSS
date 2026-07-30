import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Catalogue des Formations (PSE1, BNSSA...) dans le Var | ASSTSF",
    description: "Découvrez toutes nos formations de secourisme et sauvetage aquatique à La Seyne-sur-Mer (près de Toulon). Passez votre GQS, PSC, PSE1, PSE2, BNSSA ou SSA.",
}

export default function FormationsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}