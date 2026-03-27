# Déploiement sur VPS OVH avec CI/CD GitHub

Ce document décrit l'ensemble des étapes pour déployer TaranMedusa sur un VPS OVH et automatiser les déploiements via GitHub Actions.

---

## Architecture

```
GitHub (push main)
    │
    ▼
GitHub Actions
    ├── Build image backend  → ghcr.io
    ├── Build image storefront (avec NEXT_PUBLIC_* baked) → ghcr.io
    └── SSH → VPS OVH
                ├── docker compose pull
                └── docker compose up -d

VPS OVH
    ├── nginx (reverse proxy)
    ├── backend (port 9000)
    ├── storefront (port 8000)
    ├── postgres (port 5432, interne)
    └── redis (port 6379, interne)
```

---

## 1. Préparer le VPS OVH

### 1.1 Accéder au VPS

```bash
ssh root@<IP_DU_VPS>
```

### 1.2 Mettre à jour le système

```bash
apt update && apt upgrade -y
```

### 1.3 Installer Docker

```bash
curl -fsSL https://get.docker.com | sh
```

Vérifier l'installation :

```bash
docker --version
docker compose version
```

### 1.4 (Optionnel) Créer un utilisateur dédié

Évite de tout faire en root. Créer un user `deploy` avec accès Docker :

```bash
adduser deploy
usermod -aG docker deploy
```

### 1.5 Configurer la clé SSH pour GitHub Actions

Sur ta machine locale, générer une paire de clés dédiée au déploiement :

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/taranmedusa_deploy
```

Copier la clé publique sur le VPS :

```bash
ssh-copy-id -i ~/.ssh/taranmedusa_deploy.pub root@<IP_DU_VPS>
```

La clé privée (`taranmedusa_deploy`) sera ajoutée aux secrets GitHub (voir section 3).

---

## 2. Configurer le VPS

### 2.1 Créer le dossier de déploiement

```bash
mkdir -p /opt/taranmedusa
```

### 2.2 Créer le fichier `.env` de production

```bash
nano /opt/taranmedusa/.env
```

Contenu complet du `.env` :

```env
# ─────────────────────────────────────────────
# Images Docker (mises à jour automatiquement par la CI)
# Remplacer "ton-username" par ton username GitHub (en minuscules)
# ─────────────────────────────────────────────
BACKEND_IMAGE=ghcr.io/ton-username/taranmedusa/backend:latest
STOREFRONT_IMAGE=ghcr.io/ton-username/taranmedusa/storefront:latest

# ─────────────────────────────────────────────
# Authentification GitHub Container Registry
# Permet au VPS de pull les images privées
# ─────────────────────────────────────────────
GHCR_USER=ton-username-github
GHCR_PAT=ghp_xxxxxxxxxxxx  # voir section 3.1

# ─────────────────────────────────────────────
# Base de données
# ─────────────────────────────────────────────
POSTGRES_PASSWORD=un-mot-de-passe-tres-fort

# ─────────────────────────────────────────────
# Secrets Medusa
# ─────────────────────────────────────────────
JWT_SECRET=generer-une-chaine-aleatoire-longue
COOKIE_SECRET=generer-une-autre-chaine-aleatoire

# ─────────────────────────────────────────────
# CORS — adapter aux vrais domaines
# ─────────────────────────────────────────────
STORE_CORS=https://taran-industrie.fr
ADMIN_CORS=https://admin.taran-industrie.fr
AUTH_CORS=https://admin.taran-industrie.fr

# ─────────────────────────────────────────────
# URLs publiques
# ─────────────────────────────────────────────
STORE_URL=https://taran-industrie.fr
ADMIN_URL=https://admin.taran-industrie.fr
ADMIN_NOTIFICATION_EMAIL=admin@taran-industrie.fr

# ─────────────────────────────────────────────
# Stripe (utiliser les clés LIVE en production)
# ─────────────────────────────────────────────
STRIPE_API_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# ─────────────────────────────────────────────
# SMTP OVH
# ─────────────────────────────────────────────
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@taran-industrie.fr
SMTP_PASSWORD=ton-mot-de-passe-email
SMTP_FROM="Taran <contact@taran-industrie.fr>"

# ─────────────────────────────────────────────
# Paramètres région
# ─────────────────────────────────────────────
STORE_DEFAULT_COUNTRY=fr

# ─────────────────────────────────────────────
# Storefront (runtime uniquement)
# ─────────────────────────────────────────────
REVALIDATE_SECRET=generer-une-chaine-aleatoire
```

> **Générer des secrets aléatoires :**
> ```bash
> openssl rand -base64 32
> ```

### 2.3 Sécuriser le fichier `.env`

```bash
chmod 600 /opt/taranmedusa/.env
```

---

## 3. Configurer GitHub

### 3.1 Créer un Personal Access Token (PAT) pour ghcr.io

Ce token permet au VPS de pull les images Docker depuis GitHub Container Registry.

1. Aller sur **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Cliquer sur **Generate new token (classic)**
3. Donner un nom : `taranmedusa-vps-pull`
4. Cocher uniquement : `read:packages`
5. Générer et copier le token (`ghp_xxxxx`)
6. Le coller dans le `.env` VPS à la ligne `GHCR_PAT=`

### 3.2 Ajouter les secrets GitHub Actions

Dans le repo GitHub : **Settings → Secrets and variables → Actions → New repository secret**

| Nom du secret | Description | Valeur |
|---|---|---|
| `VPS_HOST` | IP ou hostname du VPS | `51.xxx.xxx.xxx` |
| `VPS_USER` | Utilisateur SSH | `root` ou `deploy` |
| `VPS_SSH_KEY` | Clé SSH privée | Contenu de `~/.ssh/taranmedusa_deploy` |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL API backend | `https://api.taran-industrie.fr` ou `https://taran-industrie.fr:9000` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Clé publishable Medusa | `pk_xxxxx` |
| `NEXT_PUBLIC_BASE_URL` | URL du storefront | `https://taran-industrie.fr` |
| `NEXT_PUBLIC_DEFAULT_REGION` | Région par défaut | `fr` |

> **Récupérer la clé publishable Medusa :**
> Dans l'admin Medusa → Settings → Publishable API Keys

---

## 4. Configurer nginx (reverse proxy)

nginx fait le pont entre les ports Docker et les domaines HTTPS.

### 4.1 Installer nginx et Certbot

```bash
apt install -y nginx certbot python3-certbot-nginx
```

### 4.2 Créer les configurations de sites

**Storefront** (`/etc/nginx/sites-available/taran-storefront`) :

```nginx
server {
    listen 80;
    server_name taran-industrie.fr www.taran-industrie.fr;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Backend** (`/etc/nginx/sites-available/taran-backend`) :

```nginx
server {
    listen 80;
    server_name api.taran-industrie.fr;

    client_max_body_size 50m;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.3 Activer les sites

```bash
ln -s /etc/nginx/sites-available/taran-storefront /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/taran-backend /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 4.4 Générer les certificats SSL

```bash
certbot --nginx -d taran-industrie.fr -d www.taran-industrie.fr
certbot --nginx -d api.taran-industrie.fr
```

Certbot modifie automatiquement les configs nginx pour le HTTPS et configure le renouvellement automatique.

---

## 5. Premier déploiement manuel

Avant de déclencher la CI/CD, faire un premier déploiement à la main pour s'assurer que tout fonctionne.

### 5.1 Se connecter au VPS

```bash
ssh root@<IP_DU_VPS>
cd /opt/taranmedusa
```

### 5.2 S'authentifier sur ghcr.io

```bash
source .env
echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
```

### 5.3 Copier le docker-compose.yml sur le VPS

Depuis ta machine locale :

```bash
scp docker-compose.yml root@<IP_DU_VPS>:/opt/taranmedusa/
```

### 5.4 Déclencher un premier push sur main pour builder les images

```bash
git add .
git commit -m "setup: docker et ci/cd"
git push origin main
```

Attendre que le job `build-and-push` se termine dans l'onglet **Actions** du repo GitHub.

### 5.5 Lancer les containers sur le VPS

```bash
cd /opt/taranmedusa
docker compose pull
docker compose up -d
```

### 5.6 Vérifier que tout tourne

```bash
docker compose ps
docker compose logs backend --tail=50
docker compose logs storefront --tail=50
```

---

## 6. Vérifier le CI/CD

À partir de maintenant, chaque `git push` sur `main` déclenche automatiquement :

1. Build de l'image backend → push sur `ghcr.io`
2. Build de l'image storefront (avec les vars `NEXT_PUBLIC_*` baked) → push sur `ghcr.io`
3. SSH sur le VPS → `docker compose pull` + `docker compose up -d`

Suivre l'avancement dans l'onglet **Actions** du repo GitHub.

---

## 7. Configuration DNS OVH

Dans l'espace client OVH → **Web Cloud → Noms de domaine → Zone DNS** :

| Type | Sous-domaine | Cible |
|---|---|---|
| A | `@` | `<IP_DU_VPS>` |
| A | `www` | `<IP_DU_VPS>` |
| A | `api` | `<IP_DU_VPS>` |
| A | `admin` | `<IP_DU_VPS>` |

La propagation DNS peut prendre jusqu'à 24h (souvent 15-30 min avec OVH).

---

## 8. Récupérer la clé publishable Medusa

Une fois le backend déployé, récupérer la clé publishable Medusa pour la configurer dans GitHub Secrets.

Si tu n'as pas encore créé d'utilisateur admin :

```bash
cd /opt/taranmedusa
docker compose exec backend npx medusa user -e admin@taran-industrie.fr -p motdepasse
```

Se connecter à l'admin Medusa sur `https://admin.taran-industrie.fr` → **Settings → Publishable API Keys** → copier la clé → mettre à jour le secret GitHub `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` → re-pusher pour rebuilder le storefront.

---

## 9. Commandes utiles

```bash
# Voir les logs en direct
docker compose logs -f backend
docker compose logs -f storefront

# Redémarrer un service
docker compose restart backend

# Stopper tout
docker compose down

# Stopper et supprimer les volumes (DANGER — supprime la base de données)
docker compose down -v

# Shell dans le backend
docker compose exec backend sh

# Lancer une migration manuellement
docker compose exec backend npx medusa db:migrate
```

---

## 10. Checklist finale

- [ ] VPS OVH créé et accessible en SSH
- [ ] Docker installé sur le VPS
- [ ] Dossier `/opt/taranmedusa/` créé avec `.env` rempli
- [ ] PAT GitHub créé avec `read:packages` et ajouté au `.env` VPS
- [ ] Clé SSH dédiée créée et ajoutée au VPS
- [ ] Secrets GitHub Actions configurés (7 secrets)
- [ ] nginx installé et configuré pour storefront et backend
- [ ] Certificats SSL générés avec Certbot
- [ ] DNS OVH configuré (A records)
- [ ] Premier push déclenché et images buildées sur ghcr.io
- [ ] `docker compose up -d` lancé sur le VPS
- [ ] Backend accessible sur `https://api.taran-industrie.fr/health`
- [ ] Storefront accessible sur `https://taran-industrie.fr`
- [ ] CI/CD testé avec un deuxième push
