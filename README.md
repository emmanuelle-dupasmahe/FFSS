# Projet de Gestion pour la FFSS (Titre à adapter)

Ce projet est une application web conçue pour [Décrivez ici l'objectif principal de votre application, par exemple : "gérer les membres, les formations et les interventions de l'association..."].

## ✨ Fonctionnalités

*   **Authentification des utilisateurs** : Inscription et connexion sécurisées avec NextAuth.js.
*   **Gestion des emails** : Envoi d'emails transactionnels via SMTP (Gmail) ou Resend.
*   **Upload de fichiers** : Téléchargement de fichiers géré par UploadThing.
*   **Base de données** : Utilisation d'une base de données PostgreSQL hébergée sur Supabase.

## 🛠️ Stack Technique

*   **Framework** : [Next.js](https://nextjs.org/) (supposé)
*   **Authentification** : [NextAuth.js](https://next-auth.js.org/)
*   **Base de données** : [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
*   **ORM** : [Prisma](https://www.prisma.io/) (supposé, en raison des variables `DATABASE_URL` et `DIRECT_URL`)
*   **Upload de fichiers** : UploadThing
*   **Envoi d'emails** : Nodemailer (pour SMTP) / Resend

## 🚀 Démarrage Rapide

Suivez ces étapes pour lancer le projet en local.

### Prérequis

*   Node.js (version 18.x ou supérieure)
*   pnpm (ou npm/yarn)

### Installation

1.  **Clonez le dépôt**

    ```bash
    git clone <URL_DU_DEPOT>
    cd <NOM_DU_DOSSIER>
    ```

2.  **Installez les dépendances**

    ```bash
    pnpm install
    ```

3.  **Configurez les variables d'environnement**

    Copiez le fichier `.env.example` (si vous en créez un) ou créez un fichier `.env` à la racine du projet, puis remplissez les variables nécessaires.

    ```bash
    cp .env.example .env
    ```

    Votre fichier `.env` doit contenir les variables listées ci-dessous.

4.  **Appliquez les migrations de la base de données**

    Si vous utilisez Prisma, exécutez la commande suivante pour mettre à jour le schéma de votre base de données.

    ```bash
    pnpm prisma migrate dev
    ```

5.  **Lancez le serveur de développement**

    ```bash
    pnpm dev
    ```

    L'application sera accessible à l'adresse http://localhost:3000.

## ⚙️ Variables d'Environnement

Ces variables sont nécessaires pour le bon fonctionnement de l'application.

| Variable                | Description                                                              | Exemple                                                                          |
| ----------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `DATABASE_URL`          | URL de connexion à la base de données (avec connection pooling).         | `postgresql://user:password@host:port/db?pgbouncer=true`                         |
| `DIRECT_URL`            | URL de connexion directe à la base de données (pour les migrations).     | `postgresql://user:password@host:port/db`                                        |
| `EMAIL_SERVER_HOST`     | Hôte du serveur SMTP pour l'envoi d'emails.                              | `smtp.gmail.com`                                                                 |
| `EMAIL_SERVER_PORT`     | Port du serveur SMTP.                                                    | `465`                                                                            |
| `EMAIL_SERVER_USER`     | Adresse email utilisée pour l'envoi.                                     | `votre.email@gmail.com`                                                          |
| `EMAIL_SERVER_PASSWORD` | Mot de passe d'application pour le compte email.                         | `votre_mot_de_passe_application`                                                 |
| `UPLOADTHING_TOKEN`     | Clé secrète pour le service UploadThing.                                 | `sk_live_...`                                                                    |
| `RESEND_API_KEY`        | Clé API pour le service d'envoi d'emails Resend.                         | `re_...`                                                                         |
| `NEXTAUTH_SECRET`       | Une chaîne de caractères aléatoire utilisée pour signer les jetons JWT.  | `générez_un_secret_solide`                                                       |
| `NEXTAUTH_URL`          | L'URL de base de votre application.                                      | `http://localhost:3000`                                                          |
| `AUTH_URL`              | L'URL de base pour l'authentification (souvent la même que `NEXTAUTH_URL`). | `http://localhost:3000`                                                          |

---

> **Note de sécurité** : Le fichier `.env` contient des informations sensibles et ne doit **jamais** être versionné avec Git. Assurez-vous que votre fichier `.gitignore` contient la ligne `.env`.