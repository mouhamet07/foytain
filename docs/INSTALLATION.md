# Guide d'installation complet

## 1. Prérequis

| Outil | Version minimale | Installation |
|-------|-----------------|-------------|
| Node.js | 20+ | https://nodejs.org |
| npm | 9+ | inclus avec Node |
| Docker | 24+ | https://docker.com |
| Git | - | https://git-scm.com |

---

## 2. Installation rapide (recommandée)

### a) Cloner et configurer

```bash
git clone https://github.com/votre-org/Foytain.git
cd Foytain

# Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### b) Éditer `backend/.env`

Les variables **obligatoires** à changer :

```env
DATABASE_URL="postgresql://Foytain_user:Foytain_pass_2024@localhost:5432/Foytain"
JWT_SECRET=une_cle_secrete_tres_longue_et_aleatoire_minimum_32_caracteres
JWT_REFRESH_SECRET=une_autre_cle_secrete_differente_minimum_32_caracteres
CLOUDINARY_CLOUD_NAME=votre-nom-cloud
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

### c) Lancer avec Docker

```bash
docker-compose up --build -d

# Attendre 30s que la DB démarre, puis seed (optionnel)
docker-compose exec backend npx ts-node prisma/seed.ts

# Vérifier
curl http://localhost:3001/api/v1/health
```

---

## 3. Installation manuelle

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed    
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 4. Vérification

| Service | URL | Attendu |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Landing page |
| API | http://localhost:3001/api/v1/health | `{"status":"ok"}` |
| Swagger | http://localhost:3001/api/docs | Documentation API |

---

## 5. Connexion de test

```
Email:    fatou@example.com
Password: User@123456
```

---

## 6. Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Réinitialiser la base de données
docker-compose exec backend npx prisma migrate reset

# Accéder à Prisma Studio (visualisation DB)
docker-compose exec backend npx prisma studio

# Reconstruire un service
docker-compose up --build backend -d

# Arrêter tout
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```
