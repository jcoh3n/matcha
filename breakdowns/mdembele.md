# Breakdown Full-Stack – Dev A

## Sprint 0 — Socle
- [ ] Initialiser backend Express + PostgreSQL
- [ ] Créer migrations `users`, `sessions`
- [ ] Initialiser frontend React (Vite) + Tailwind
- [ ] Layout global : Header / Main / Footer
- [ ] Vérifier communication FE ↔ BE (endpoint `/health`)

---

## Sprint 1 — Authentification (IV.1)
### Backend
- [ ] `POST /auth/register` (hash bcrypt, politique MDP)
- [ ] `POST /auth/login` (JWT access+refresh)
- [ ] `POST /auth/verify-email`, `POST /auth/forgot-password`, `POST /auth/reset-password`
- [ ] Middleware `authJWT`

### Frontend
- [ ] Pages Register + Login (form validation, toasts)
- [ ] Page Verify Email (mock lien)
- [ ] Page Reset/Forgot
- [ ] Bouton Logout global

### Intégration
- [ ] Contrat JSON commun (payloads register/login)
- [ ] E2E : Register → Verify → Login → Logout

---

## Sprint 2 — Profil & Localisation (IV.2)
### Backend
- [ ] Tables : `profiles`, `tags`, `user_tags`, `photos`, `locations`
- [ ] `GET/PUT /me` (bio, orientation, genre)
- [ ] `POST /me/photos` (≤5), `PUT /me/photos/:id/profile`
- [ ] `GET/POST/DELETE /me/tags`
- [ ] `PUT /me/location` (GPS | IP | MANUAL)

### Frontend
- [ ] Page Onboarding (bio, orientation, genre)
- [ ] UI gestion tags (autocomplete)
- [ ] Upload photos (galerie + définir photo profil)
- [ ] Localisation : bouton GPS, fallback IP, champ manuel

### Intégration
- [ ] Vérifier les 3 modes de localisation
- [ ] Vérifier limite photo profil (max 5, min 1)

---

## Sprint 3 — Découverte & Recherche (IV.3–IV.4)
### Backend
- [ ] `GET /suggested?sort=&ageMin=&...`
- [ ] `GET /search` (mêmes filtres)
- [ ] Logique orientation (bisexuel par défaut si non défini)
- [ ] Exclure bloqués/inactifs

### Frontend
- [ ] Page Discover : cartes (photo, âge, distance, fame)
- [ ] Tri (âge, distance, fame, tags communs)
- [ ] Filtres (âge, distance, fame, tags)
- [ ] Page Search avec multi-critères

### Intégration
- [ ] Vérifier différence tri vs filtre
- [ ] Pagination/infinite scroll côté UI

---

## Sprint 4 — Vue Profil & Actions (IV.5)
### Backend
- [ ] `GET /profiles/:id` (infos publiques)
- [ ] `POST/DELETE /likes/:id`
- [ ] `POST /profiles/:id/block`, `POST /profiles/:id/report`
- [ ] Log `profile_views`

### Frontend
- [ ] Page Profil utilisateur (galerie, bio, fame, distance)
- [ ] Boutons Like / Unlike
- [ ] Boutons Block / Report
- [ ] Badge “vous a liké” / “match”

### Intégration
- [ ] Vérifier règle “pas de photo profil → like interdit”
- [ ] Vérifier que block cache l’utilisateur

---

## Sprint 5 — Chat & Notifications (IV.6–IV.7)
### Backend
- [ ] Tables : `matches`, `messages`, `notifications`
- [ ] WS namespaces `chat` & `notifications` (auth JWT)
- [ ] REST fallback pour messages et notifs
- [ ] Générer match à like réciproque

### Frontend
- [ ] Page Chat (liste conversations + vue conversation)
- [ ] Notifications : cloche + badge, panneau liste
- [ ] UX popup “Match” à like réciproque

### Intégration
- [ ] Vérifier latence ≤10s pour chat & notifs
- [ ] Vérifier unlike → coupe chat/notifs
