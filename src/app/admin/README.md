# 🚑 Plateforme ASSTSF - Secourisme et Sauvetage

Plateforme web complète développée pour l'**Association des Secouristes de la Seyne Tamaris Six-Fours** (ASSTSF), affiliée à la **FFSS** (Fédération Française de Sauvetage et de Secourisme) et agréée Sécurité Civile.

Cette application permet de gérer la présence en ligne de l'association, de traiter les demandes de Dispositifs Prévisionnels de Secours (DPS) et de fluidifier le processus d'inscription aux différentes formations de secourisme et sauvetage aquatique.

## 🚀 Technologies Utilisées

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Langage:** TypeScript & React
- **Base de données / ORM:** [Prisma](https://www.prisma.io/)
- **Authentification:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icônes:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

---

## ✨ Fonctionnalités

### 🌐 Espace Public

- **Demandes de DPS (Postes de Secours) :**
  - Formulaire de demande pour les organisateurs d'événements.
  - Présentation des différentes configurations de secours (Petite, Moyenne, Grande envergure, etc.).
- **Catalogue de Formations :**
  - **Secourisme terrestre :** PSC1, PSE1, PSE2.
  - **Sauvetage aquatique :** BSB, BNSSA, SSA.
  - **Maintien des Acquis (MAC) :** Formations de recyclage.
  - Demandes de devis et préinscriptions en ligne.

### 🛡️ Espace Administration (`/admin`)

Un tableau de bord complet réservé aux membres du bureau et administrateurs pour piloter l'association :

- **Gestion des Demandes de DPS :**
  - Validation et traitement des demandes.
  - **Calcul du RIS automatique** (Risque d'Intervention des Secours) selon la grille nationale.
  - Génération de fiches récapitulatives dimensionnées et optimisées pour l'impression (A4).
- **Gestion des Formations & Inscriptions :**
  - Suivi des dossiers d'inscription des candidats et des structures.
  - Vérification des prérequis (ex: validation du niveau de nage, diplômes antérieurs).
  - Possibilité d'accepter/refuser et de notifier les candidats.
- **CMS Intégré (Contenu du site) :**
  - Éditeur simplifié permettant de modifier les textes, titres et slogans du site public (Hero sections).
  - Gestionnaire d'images pour les carrousels (DPS, Formations) directement depuis le panneau admin.
  - Gestion du catalogue des configurations DPS.
- **Annuaire Membres :** Base de données sécurisée des utilisateurs et secouristes de l'association.

---

## 🛠️ Installation et Démarrage

### Prérequis

- Node.js (version 18+ recommandée)
- Une base de données relationnelle (ex: MySQL, PostgreSQL) paramétrée dans votre environnement (ex: Laragon).

### Étapes d'installation

1. **Cloner / Préparer le dépôt**
   Placez-vous dans le répertoire du projet (`c:\laragon\www\FFSS\asstsf-platform` si vous utilisez Laragon).

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   Créez un fichier `.env` à la racine du projet en vous basant sur un éventuel `.env.example`.
   Vérifiez que votre chaîne de connexion Prisma (`DATABASE_URL`) est correcte.

4. **Initialisation de la base de données**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *(Utilisez `npx prisma migrate dev` si vous gérez des migrations strictes).*

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur http://localhost:3000.

---

## 🎨 Thème & Design

Le site prend en compte les modes **Clair** et **Sombre** de manière globale via Tailwind CSS. 
*Note : Les impressions de devis/RIS depuis l'administration forcent un mode clair afin d'économiser l'encre et assurer un rendu professionnel standardisé.*