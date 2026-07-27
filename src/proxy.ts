import { auth } from "@/auth"
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // Définition des routes publiques qui ne nécessitent pas de connexion
  const publicRoutes = ["/", "/login", "/register", "/formations", "/confidentialite"];

  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname === route || (route !== "/" && nextUrl.pathname.startsWith(route))
  );

  // Si la route est publique, on ne fait rien, on laisse passer.
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Si la route n'est PAS publique ET que l'utilisateur n'est PAS connecté,
  // on le redirige vers la page de login.
  // NextAuth.js s'occupe de cette redirection par défaut quand on arrive ici.
})

export const config = {
  // Le `matcher` définit les chemins qui seront protégés par le middleware.
  // Les routes listées ici seront vérifiées pour l'authentification.
  // Si une route est protégée et l'utilisateur n'est pas connecté, NextAuth.js redirigera vers la page de connexion (`/login`).
  matcher: [
    "/espace-stagiaire/:path*", // Protège l'espace stagiaire et toutes ses sous-routes
    "/dashboard/:path*",       // Protège le dashboard et toutes ses sous-routes
    "/profile/:path*",         // Protège les routes de profil (si vous en avez d'autres que la racine)
    "/admin/:path*",           // Protège les routes d'administration
    // Les routes non listées ici (comme '/', '/login', '/confidentialite', '/formations', etc.) seront publiques par défaut au niveau du middleware.
  ],
};