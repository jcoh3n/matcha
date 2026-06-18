# 🍵 Matcha — Lancement & configuration

Tutoriel complet pour installer, configurer et tester le projet de A à Z.

---

## 1. Prérequis

- **Docker Desktop** (ou Docker Engine + Compose v2) installé et **lancé**.
  - Vérifier : `docker info` doit répondre sans erreur.
- C'est tout. Pas besoin d'installer Node, PostgreSQL, etc. : tout tourne dans Docker.

---

## 2. Démarrage en une commande (recommandé)

```bash
./setup.sh
```

Le script `setup.sh` est **idempotent** (on peut le relancer sans risque) et fait tout :

1. Vérifie que Docker tourne.
2. Crée/complète **`app/backend/.env`** avec toutes les variables nécessaires :
   - identifiants base de données,
   - **secrets JWT générés aléatoirement** (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`),
   - `CORS_ORIGIN`, `FRONTEND_URL`, durées de token…
   - **configuration email** : si aucune n'est présente, il **provisionne automatiquement une boîte mail de test Ethereal** (indispensable pour la **vérification d'email** et le **mot de passe oublié** — voir §5).
3. Crée/complète **`app/frontend/.env`** (`VITE_API_URL`).
4. **Construit et démarre** les conteneurs (`db`, `backend`, `frontend`).
5. Au premier démarrage, le backend **exécute les migrations** et **seed ≥ 500 profils** automatiquement.
6. Attend que le backend soit *healthy* et affiche un récapitulatif (URLs, comptes de test, accès aux emails).

### Options
```bash
./setup.sh            # setup env + build + start
./setup.sh --no-build # démarrer sans reconstruire les images
./setup.sh --reset    # ⚠️ efface la base (volume) + reconstruit + reseed à neuf
./setup.sh --help
```

---

## 3. Accès à l'application

| Service | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:3000 (health : `/health`) |
| **PostgreSQL** | `localhost:5432` (db `matcha_db`) |

### Comptes de test seedés (mot de passe : `P`)
| Email | Username | Profil |
|---|---|---|
| `helena.morel@example.com` | `smallmouse465` | F / bisexuelle |
| `abel.riviere@example.com` | `ticklishcat4201` | H / hétéro |

> helena ↔ abel sont **compatibles** → pratique pour tester like / match / chat.
> La connexion accepte **l'email OU le username**.

---

## 4. Le « mot de passe oublié » (et la vérification d'email)

Les emails (lien de **vérification de compte** et lien de **réinitialisation de mot de passe**) sont envoyés via **SMTP**. En dev, on utilise **Ethereal** : un faux SMTP qui **n'envoie rien réellement** mais **capture** les emails pour les consulter en ligne.

### Comment lire les emails envoyés
1. Récupère les identifiants Ethereal :
   ```bash
   grep -E 'EMAIL_USER|EMAIL_PASS' app/backend/.env
   ```
   (ils sont aussi affichés par `setup.sh` au premier lancement)
2. Va sur **https://ethereal.email**, connecte-toi avec `EMAIL_USER` / `EMAIL_PASS`.
3. Onglet **Messages** → tu vois les emails de vérification / reset → clique le lien dedans.

### Tester le flux « mot de passe oublié »
1. `http://localhost:5173/auth/login` → **« Mot de passe oublié ? »**.
2. Saisis l'email d'un compte **vérifié** (ex. `helena.morel@example.com`).
3. Ouvre l'email sur Ethereal → clique « Réinitialiser » → tu arrives sur `/auth/reset-password?token=…`.
4. Choisis un nouveau mot de passe (≥ 8 caractères, une lettre + un chiffre, pas un mot trop courant).

> **Astuce sans email** — récupérer un token directement en base :
> ```bash
> # token de reset
> docker exec matcha_db psql -U matcha_user -d matcha_db -t \
>   -c "SELECT password_reset_token FROM users WHERE email='helena.morel@example.com';"
> # token de vérification (compte non vérifié)
> docker exec matcha_db psql -U matcha_user -d matcha_db -t \
>   -c "SELECT email_verification_token FROM users WHERE email='TON_EMAIL';"
> ```
> puis ouvrir `http://localhost:5173/auth/reset-password?token=<token>`
> ou `http://localhost:5173/auth/verify-email?token=<token>`.

### Utiliser un vrai SMTP (Gmail, etc.) — optionnel
Édite `app/backend/.env` :
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ton.adresse@gmail.com
EMAIL_PASS=ton_mot_de_passe_application   # "App Password" Google, pas le mdp du compte
EMAIL_FROM=noreply@matcha.com
```
puis `docker compose restart backend`.

---

## 5. Variables d'environnement (référence)

`app/backend/.env` (non versionné — généré par `setup.sh`) :

| Variable | Rôle |
|---|---|
| `POSTGRES_* / DB_*` | connexion PostgreSQL (en Docker, l'hôte est forcé à `db`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | **obligatoires** — le backend refuse de démarrer sans |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | durées des tokens (15m / 7d) |
| `CORS_ORIGIN` | origine front autorisée (`http://localhost:5173`) |
| `FRONTEND_URL` | base des liens dans les emails |
| `EMAIL_HOST/PORT/USER/PASS/FROM` | SMTP pour vérif + reset |
| `PORT`, `NODE_ENV` | serveur |

`app/frontend/.env` : `VITE_API_URL=http://localhost:3000`

> ⚠️ Ces fichiers `.env` sont **ignorés par Git** (les secrets ne doivent jamais être commités). Seuls les `.env.example` sont versionnés.

---

## 6. Commandes utiles

```bash
# Logs
docker compose logs -f            # tout
docker compose logs -f backend    # backend uniquement

# Tests backend (69 tests, base de test isolée auto-créée)
docker exec matcha_backend npm test

# Base de données
docker exec -it matcha_db psql -U matcha_user -d matcha_db

# Cycle de vie
docker compose down               # arrêter (garde la base)
docker compose down -v            # arrêter + supprimer la base
./setup.sh --reset                # repartir de zéro (reseed)

# Via Makefile
make up | down | logs | rebuild | clean
make setup                        # = ./setup.sh
```

---

## 7. Dépannage

| Problème | Solution |
|---|---|
| `Docker daemon is not running` | Lancer Docker Desktop, attendre, relancer `./setup.sh` |
| Port `5173`/`3000`/`5432` déjà utilisé | Libérer le port (`lsof -i :3000`) ou modifier les ports dans `docker-compose.yml` |
| Backend ne devient pas *healthy* | `docker compose logs backend` ; souvent un souci de `.env` (secrets JWT manquants) → `./setup.sh` les régénère |
| Moins de 500 profils | Le seed dépend du réseau (randomuser.me). `./setup.sh --reset` pour relancer le seed |
| Emails introuvables | Vérifier `EMAIL_USER/PASS` dans `app/backend/.env` et se connecter sur https://ethereal.email ; sinon récupérer les tokens en base (§4) |
| Tout casser et recommencer | `./setup.sh --reset` (ou `make clean` puis `./setup.sh`) |

---

## 8. Parcours de test rapide (front)

1. **Inscription** (`/`) → tester les validations (mdp commun, username pris) → email de vérification (Ethereal).
2. **Connexion** par email *ou* username ; **mot de passe oublié** (§4) ; **logout** (header).
3. **Onboarding/Profil** : genre, orientation, bio, tags, ≤5 photos, localisation (GPS/IP/manuel) ; éditer **prénom/nom/email**.
4. **Discover** : suggestions selon orientation, **filtres** (âge, distance, popularité min/max, tags) et **tri** (âge/distance/popularité/tags communs).
5. **Recherche** (barre header) par username ; tri/filtre.
6. **Profil public** : visite enregistrée, **en ligne/dernière connexion**, **like → match**, report, **block** (disparaît + chat coupé), unlike.
7. **Chat temps réel** entre comptes matchés (2 navigateurs) + **badge messages** global.
8. **Notifications** temps réel (like, visite, message, match, unlike) + **badge** global.
9. **Responsive** (réduire la fenêtre) + **console (F12) sans erreurs**.

Bon test ! 🍵
