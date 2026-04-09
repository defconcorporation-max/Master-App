# Master App – Command Center

Dashboard multi-apps qui agrège **Auclaire** (Supabase), **Defcon** (Turso), **Viva Vegas** (MongoDB) et **DRS Auto Detailing** (SQLite) : stats globales, finances, graphiques, activité, recherche omni et assistant IA (J.A.R.V.I.S.).

## Prérequis

- Node.js 18+
- Variables d’environnement (voir [.env.example](.env.example))

## Installation

```bash
npm install
cp .env.example .env.local
# Éditer .env.local avec vos clés et chemins
```

## Démarrage

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande     | Description              |
|-------------|--------------------------|
| `npm run dev`   | Serveur de développement |
| `npm run build` | Build production         |
| `npm run start` | Démarrer en production   |
| `npm run lint`  | Linter Next.js           |

## Variables d’environnement

- **MASTER_ROOT_DIR** : racine des dossiers (ex. `f:/Entreprises`). Utilisé par le scanner, les workers et le chemin DRS par défaut.
- **DRS_DB_PATH** : (optionnel) chemin complet vers `dev.db` DRS si différent de `MASTER_ROOT_DIR/DRS/detailing software/prisma/dev.db`.
- **AUCLAIRE_APP_URL**, **DEFCON_APP_URL**, **ANTIGRAVITY_APP_URL**, **DRS_APP_URL** : (optionnel) URLs des apps pour les boutons « Ouvrir [App] » en haut du dashboard.
- **AUCLAIRE_***, DEFCON_***, ANTIGRAVITY_***** : connexions Supabase / Turso / MongoDB.
- **GEMINI_API_KEY** : résumé IA et workers. **GOOGLE_GENERATIVE_AI_API_KEY** : J.A.R.V.I.S.
- **MASTER_API_KEY** : si défini, les webhooks (`/api/webhooks`, `/api/webhooks/sentry`) exigent le header `x-master-api-key`.

Détail dans [.env.example](.env.example).

## Sécurité

- Les webhooks (Sentry, générique) peuvent être protégés avec `MASTER_API_KEY` et le header `x-master-api-key`.
- Ne pas commiter `.env.local` (déjà dans `.gitignore`).

## Structure

- `src/app` : pages et routes API (Next.js App Router).
- `src/components` : composants dashboard (graphiques, Kanban, recherche, etc.).
- `src/lib` : clients DB (`db-clients`), recherche, actions serveur, auth API.
- `src/workers` : scripts autonomes (SOC2, Neural Link, Black Box, rev-share).

## API

- **GET /api/health** : état des connexions (Auclaire, Defcon, Viva Vegas, DRS). Réponse `healthy` ou `degraded` selon les apps joignables.

## Déploiement

Build puis déploiement classique (Vercel, Node, etc.). En production, définir **MASTER_ROOT_DIR** et **DRS_DB_PATH** selon l’environnement (ou désactiver DRS si non utilisé). Protéger les webhooks avec **MASTER_API_KEY**.
