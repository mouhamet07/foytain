# Foytain 🏥

> Plateforme SaaS de tontine médicale — solidarité financière pour la santé

Foytain permet à des communautés de créer des groupes de cotisation (tontines) afin d'aider financièrement leurs membres face à des dépenses médicales. Les membres cotisent régulièrement, soumettent des demandes d'aide, votent communautairement, et les fonds sont versés aux bénéficiaires approuvés.

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Hook Form, Zod |
| **Backend** | NestJS, TypeScript, Prisma ORM, JWT + Refresh Tokens, RBAC |
| **Base de données** | PostgreSQL 16 (Neon-compatible) |
| **Upload fichiers** | Cloudinary |
| **Infra** | Docker, Docker Compose, Vercel (frontend), Render (backend) |

---

## Architecture

```
Foytain/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/            # JWT, refresh, bcrypt, RBAC
│   │   ├── users/           # CRUD utilisateurs + avatar
│   │   ├── tontines/        # Gestion tontines PUBLIC/PRIVATE
│   │   ├── memberships/     # Adhésions, invitations, approbations
│   │   ├── contributions/   # Cotisations + cron LATE
│   │   ├── payments/        # Paiements + webhooks
│   │   ├── medical-requests/# Demandes aide + upload docs
│   │   ├── votes/           # Vote communautaire + auto-clôture
│   │   ├── notifications/   # In-app notifications
│   │   ├── dashboard/       # Statistiques et KPIs
│   │   ├── admin/           # Panneau d'administration
│   │   ├── cloudinary/      # Service d'upload
│   │   ├── mail/            # Service email (SMTP)
│   │   ├── prisma/          # PrismaService global
│   │   └── common/          # Guards, filtres, interceptors, décorateurs
│   ├── prisma/
│   │   ├── schema.prisma    # Schéma complet avec 10 modèles
│   │   └── seed.ts          # Données initiales
│   └── Dockerfile
├── frontend/                # App Next.js 15
│   ├── src/
│   │   ├── app/             # App Router (layouts, pages)
│   │   ├── components/      # UI, layout, shared
│   │   ├── services/        # Clients API Axios
│   │   ├── store/           # Zustand (auth)
│   │   ├── types/           # TypeScript types
│   │   └── lib/             # utils, axios config
│   └── Dockerfile
├── docs/                    # Documentation
├── docker-compose.yml       # Stack production
├── docker-compose.dev.yml   # Stack développement
└── README.md
```

---

## Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) & Docker Compose
- [PostgreSQL](https://www.postgresql.org/) (ou compte [Neon](https://neon.tech))
- Compte [Cloudinary](https://cloudinary.com)

---

### Option 1 — Docker Compose (recommandé)

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-compte/Foytain.git
cd Foytain

# 2. Copier et configurer les variables d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Éditez backend/.env avec vos vraies valeurs Cloudinary, email, etc.

# 3. Lancer toute la stack
docker-compose up --build -d

# 4. Vérifier les logs
docker-compose logs -f backend

# L'application est disponible sur :
# Frontend : http://localhost:3000
# Backend  : http://localhost:3001/api/v1
# Swagger  : http://localhost:3001/api/docs
```

---

### Option 2 — Développement local (sans Docker)

#### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditez .env avec votre DATABASE_URL, JWT_SECRET, etc.

# Générer le client Prisma
npx prisma generate

# Lancer les migrations
npx prisma migrate dev --name init

# Peupler la base de données (données de démo)
npm run prisma:seed

# Démarrer en mode développement
npm run start:dev

# API disponible sur : http://localhost:3001/api/v1
# Swagger docs      : http://localhost:3001/api/docs
```

#### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Éditez .env.local

# Démarrer
npm run dev

# App disponible sur : http://localhost:3000
```

---

## Variables d'environnement

### Backend (`backend/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL (Neon-compatible) | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Clé secrète JWT access token | chaîne aléatoire longue |
| `JWT_EXPIRATION` | Durée du token d'accès | `15m` |
| `JWT_REFRESH_SECRET` | Clé secrète refresh token | chaîne aléatoire longue |
| `JWT_REFRESH_EXPIRATION` | Durée du refresh token | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary | `my-cloud` |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary | `123456789` |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary | `abc123...` |
| `MAIL_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `MAIL_PORT` | Port SMTP | `587` |
| `MAIL_USER` | Adresse email expéditeur | `app@gmail.com` |
| `MAIL_PASSWORD` | Mot de passe SMTP / App Password | `xxxx xxxx` |
| `FRONTEND_URL` | URL du frontend | `http://localhost:3000` |
| `PORT` | Port d'écoute API | `3001` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_APP_URL` | URL publique du frontend | `http://localhost:3000` |

---

## Comptes de démonstration

Après `npm run prisma:seed` :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | `superadmin@Foytain.com` | `SuperAdmin@123` |
| Admin | `admin@Foytain.com` | `Admin@123456` |
| Utilisateur | `fatou@example.com` | `User@123456` |
| Utilisateur | `mamadou@example.com` | `User@123456` |

---

## API Documentation

La documentation Swagger complète est accessible sur :

```
http://localhost:3001/api/docs
```

Principaux endpoints :

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/auth/register` | Inscription |
| `POST` | `/auth/login` | Connexion |
| `POST` | `/auth/refresh` | Rafraîchir les tokens |
| `GET` | `/tontines` | Lister les tontines |
| `POST` | `/tontines` | Créer une tontine |
| `POST` | `/memberships/join` | Rejoindre une tontine |
| `GET` | `/contributions/my` | Mes cotisations |
| `POST` | `/medical-requests` | Créer une demande |
| `POST` | `/votes` | Voter pour une demande |
| `GET` | `/dashboard/user` | Dashboard utilisateur |
| `GET` | `/notifications` | Notifications |

---

## Déploiement en production

### Frontend → Vercel

```bash
# Depuis la racine du projet
cd frontend
npx vercel --prod

# Variables d'environnement Vercel :
# NEXT_PUBLIC_API_URL = https://api.Foytain.com/api/v1
```

### Backend → Render

1. Connectez votre dépôt GitHub à Render
2. Créez un **Web Service** avec :
   - **Build Command** : `npm ci && npx prisma generate && npm run build`
   - **Start Command** : `npx prisma migrate deploy && node dist/main`
3. Ajoutez toutes les variables d'environnement
4. Utilisez une base Neon PostgreSQL pour `DATABASE_URL`

### Base de données → Neon

```bash
# Neon est compatible PostgreSQL 16
# DATABASE_URL format :
postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/Foytain?sslmode=require
```

---

## Fonctionnalités

- **Authentification** — Inscription, connexion, JWT + refresh tokens, RBAC (USER / ADMIN / SUPER_ADMIN)
- **Tontines** — Création publique/privée, adhésion, invitations, activation, annulation automatique
- **Memberships** — Rejoindre, quitter, approuver/refuser, rôles (CREATOR / ADMIN / MEMBER)
- **Cotisations** — Enregistrement, historique, statuts PAID/UNPAID/LATE, cron job automatique
- **Paiements** — Suivi des transactions, méthodes multiples, notifications
- **Demandes médicales** — Création, upload de documents (Cloudinary), vote communautaire
- **Votes** — Un membre = un vote, calcul automatique majorité, clôture automatique
- **Notifications** — Système in-app temps réel, email (SMTP)
- **Dashboard** — KPIs, statistiques, graphiques par tontine
- **Admin Panel** — Gestion utilisateurs, tontines, demandes en attente
- **Upload** — Avatars et documents médicaux via Cloudinary
- **Dark Mode** — Thème clair/sombre complet
- **Responsive** — Mobile-first, PWA-ready

---

## Structure des rôles

```
SUPER_ADMIN → Accès total, gestion des admins
ADMIN       → Gestion utilisateurs, approbation demandes
USER        → Tontines, cotisations, demandes, votes
```

---

## Licence

MIT © 2024 Foytain
