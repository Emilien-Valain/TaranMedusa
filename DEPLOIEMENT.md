# Déploiement

La production tourne sur un **VPS OVH piloté par Coolify**, pas avec `docker compose` ni nginx.

> **Guide d'installation détaillé** (commande du VPS, sécurisation SSH, installation de
> Coolify, DNS, volumes) : note Obsidian `Projet Taran / Déploiement VPS OVH - Medusa Stack`.
> Ce fichier ne décrit que ce qu'un développeur doit connaître pour travailler sur le dépôt.

---

## Architecture

```
VPS OVH
└── Coolify
    ├── Traefik (reverse proxy + SSL Let's Encrypt)
    ├── backend    → https://api.taran-industrie.com   (admin sur /app)
    ├── storefront → https://taran-industrie.com
    ├── PostgreSQL → réseau interne
    └── Redis      → réseau interne
```

Les deux applications viennent du **même dépôt**, avec un `Base Directory` différent
(`/backend` et `/storefront`). Coolify ne reconstruit que le service dont le dossier a changé.

Un `git push` sur `main` déclenche le redéploiement automatique.

---

## Domaines

| Rôle | URL |
|---|---|
| Storefront | `https://taran-industrie.com` |
| API Medusa | `https://api.taran-industrie.com` |
| Admin Medusa | `https://api.taran-industrie.com/app` |

Il n'y a **pas** de sous-domaine `admin`. Le domaine `taran-industrie.fr` n'appartient pas au projet.

---

## Variables d'environnement

Elles se règlent dans Coolify, sur chaque application.

### Backend — onglet Environment Variables

```env
DATABASE_URL=postgres://user:password@postgresql-xxxxx:5432/Taran
REDIS_URL=redis://redis-xxxxx:6379
CACHE_REDIS_URL=redis://redis-xxxxx:6379
JWT_SECRET=...
COOKIE_SECRET=...
MEDUSA_FILE_BACKEND_URL=https://api.taran-industrie.com/static
STORE_CORS=https://taran-industrie.com
ADMIN_CORS=https://api.taran-industrie.com
AUTH_CORS=https://api.taran-industrie.com
STORE_URL=https://taran-industrie.com
ADMIN_URL=https://api.taran-industrie.com/app
ADMIN_NOTIFICATION_EMAIL=contact@taran-industrie.com
STORE_DEFAULT_COUNTRY=fr
REVALIDATE_SECRET=<identique au storefront>
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@taran-industrie.com
SMTP_PASSWORD=...
SMTP_FROM="Taran <contact@taran-industrie.com>"
```

`ADMIN_URL` doit contenir `/app`. Les emails d'invitation et de devis construisent leurs
liens à partir de cette variable (`${ADMIN_URL}/invite?token=…`).

### Storefront — onglet Build Args

Les variables `NEXT_PUBLIC_*` sont intégrées au moment du `yarn build`, pas à l'exécution.
Placées dans « Environment Variables », elles n'ont aucun effet.

```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.taran-industrie.com
NEXT_PUBLIC_MEDUSA_FILE_BACKEND_URL=https://api.taran-industrie.com/static
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_BASE_URL=https://taran-industrie.com
NEXT_PUBLIC_DEFAULT_REGION=fr
```

### Storefront — onglet Environment Variables

```env
REVALIDATE_SECRET=<identique au backend>
```

---

## Revalidation du cache catalogue

Le storefront met le catalogue en cache avec `cache: "force-cache"`. Deux mécanismes
le rafraîchissent.

**1. Le webhook**, chemin rapide :

```
Admin Medusa (product.created / .updated / .deleted)
  └── backend/src/subscribers/storefront-revalidate.ts
        └── POST {STORE_URL}/api/revalidate   (header x-revalidate-secret)
              └── revalidateTag("products" | "categories" | "collections")
```

**2. L'expiration par le temps**, filet de sécurité : `storefront/src/lib/data/cookies.ts`
applique `revalidate: 60` aux tags `products`, `categories`, `collections` et `regions`.

`REVALIDATE_SECRET` doit exister sur les **deux** applications, avec la même valeur.
Si elle manque côté backend, le subscriber s'arrête en silence et le catalogue se fige.

Vérification, après une modification de produit dans l'admin — logs Coolify du backend :

```
[storefront-revalidate] product.updated → tags products, categories, collections revalidés
```

Forcer la revalidation à la main, depuis n'importe quel terminal :

```bash
curl -sS -i -X POST https://taran-industrie.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: <REVALIDATE_SECRET>" \
  -d '{"tags":["products","categories","collections"]}'
```

`401` signifie que le secret ne correspond pas. `500` signifie que `REVALIDATE_SECRET`
est absent du storefront.

---

## Stockage des images produit

Le provider de fichiers écrit dans `/app/.medusa/server/static`. Sans volume persistant,
les images disparaissent à chaque redéploiement.

Coolify → backend → **Storages → Add a Persistent Storage**, chemin conteneur
`/app/.medusa/server/static`.

---

## Opérations courantes

Toutes passent par le terminal intégré de Coolify, sur le conteneur backend.

```bash
# Créer un compte admin
npx medusa user -e contact@taran-industrie.com -p motdepasse

# Vérifier les variables d'environnement
printenv | grep -E "STORE_URL|REVALIDATE_SECRET|ADMIN_URL"
```

Les migrations sont lancées automatiquement au démarrage du conteneur
(`npx medusa db:migrate && yarn start` dans `backend/Dockerfile`).

---

## Problèmes courants

| Problème | Cause | Solution |
|---|---|---|
| Produit ajouté ou supprimé invisible sur `/store`, mais son URL directe marche | `REVALIDATE_SECRET` absent du backend | L'ajouter, redéployer le backend, puis forcer avec le `curl` ci-dessus |
| Aucune ligne `storefront-revalidate` dans les logs | Subscriber absent de l'image, ou variables manquantes | `find / -name "storefront-revalidate*" -not -path "*/node_modules/*"` dans le conteneur |
| `NEXT_PUBLIC_*` sans effet | Réglées en Environment Variables | Les déplacer dans Build Args, puis rebuilder |
| Images perdues après un déploiement | Volume monté au mauvais chemin | Monter sur `/app/.medusa/server/static` |
| Lien d'invitation admin en 404 | `ADMIN_URL` sans `/app` | Corriger la variable |
| Coolify : "server is unreachable or misconfigured" | `PermitRootLogin no` dans sshd | Remettre `prohibit-password`, recharger sshd, puis Validate Server |
