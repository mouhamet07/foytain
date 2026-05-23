# Guide de déploiement en production

## Architecture cible

```
Vercel (Frontend)  →  Render / Railway (Backend)  →  Neon (PostgreSQL)
```

---

## 1. Base de données — Neon PostgreSQL

1. Créer un compte sur https://neon.tech
2. Créer un nouveau projet **"Foytain"**
3. Copier la **Connection String** (format `postgresql://...`)
4. Utiliser cette URL comme `DATABASE_URL`

```env
DATABASE_URL="postgresql://neondb_owner:abc123@ep-xxx.us-east-1.aws.neon.tech/Foytain?sslmode=require"
```

---

## 2. Backend — Render.com

### a) Créer le service

1. Aller sur https://render.com → New → **Web Service**
2. Connecter votre dépôt GitHub
3. Configurer :
   - **Root Directory** : `backend`
   - **Build Command** : `npm ci && npx prisma generate && npm run build`
   - **Start Command** : `npx prisma migrate deploy && node dist/main`
   - **Plan** : Free (dev) ou Starter (prod)

### b) Variables d'environnement sur Render

```
NODE_ENV             = production
DATABASE_URL         = [votre URL Neon]
JWT_SECRET           = [clé secrète forte 64 chars min]
JWT_EXPIRATION       = 15m
JWT_REFRESH_SECRET   = [clé différente 64 chars min]
JWT_REFRESH_EXPIRATION = 7d
FRONTEND_URL         = https://Foytain.vercel.app
CLOUDINARY_CLOUD_NAME = [votre cloud]
CLOUDINARY_API_KEY   = [votre key]
CLOUDINARY_API_SECRET = [votre secret]
```

### c) URL finale

```
https://Foytain-api.onrender.com/api/v1
```

---

## 3. Frontend — Vercel

### a) Déployer

```bash
cd frontend
npx vercel --prod
```

Ou connectez votre dépôt GitHub directement sur https://vercel.com

- **Framework Preset** : Next.js
- **Root Directory** : `frontend`
- **Build Command** : `npm run build`

### b) Variables d'environnement sur Vercel

```
NEXT_PUBLIC_API_URL     = https://Foytain-api.onrender.com/api/v1
NEXT_PUBLIC_APP_URL     = https://Foytain.vercel.app
NEXT_PUBLIC_APP_NAME    = Foytain
```

---

## 4. Cloudinary — Upload de fichiers

1. Créer un compte sur https://cloudinary.com
2. Dashboard → Settings → API Keys
3. Copier `Cloud Name`, `API Key`, `API Secret`

Les dossiers créés automatiquement :
- `Foytain/avatars/` — Photos de profil
- `Foytain/tontine-covers/` — Couvertures de tontines
- `Foytain/medical-docs/` — Documents médicaux

---

## 5. Checklist déploiement

- [ ] `DATABASE_URL` pointe vers Neon avec `sslmode=require`
- [ ] `JWT_SECRET` et `JWT_REFRESH_SECRET` sont des chaînes fortes (64+ chars)
- [ ] `CLOUDINARY_*` correctement configurés
- [ ] `FRONTEND_URL` pointe vers votre domaine Vercel
- [ ] `NEXT_PUBLIC_API_URL` pointe vers votre backend Render
- [ ] Migrations exécutées : `npx prisma migrate deploy`
- [ ] Health check OK : `GET /api/v1/health`

---

## 6. Génération de secrets sécurisés

```bash
# macOS / Linux
openssl rand -base64 48

# Node.js (partout)
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```
