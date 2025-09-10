# Breakdown Full-Stack – Dev B

## Sprint 0 — Socle
- [ ] Mettre en place Docker Compose (Postgres + serveur Node)
- [ ] Script migrations init (`users`, `profiles`)
- [ ] Config Tailwind (palette fournie)
- [ ] Router côté FE : routes Register, Login, Discover, Search, Profile, Chat
- [ ] Test `/health` affiché côté UI

---

## Sprint 1 — Authentification (IV.1)
### Backend
- [ ] `POST /auth/logout` (invalidate refresh)
- [ ] Sécuriser cookies/token
- [ ] Gestion erreurs normalisées

### Frontend
- [ ] UI Forgot/Reset Password
- [ ] Gestion tokens JWT (access+refresh)
- [ ] Redirections conditionnelles (si non loggé → /login)

### Intégration
- [ ] E2E complet Auth (Dev A fournit endpoints, Dev B valide côté UI)
- [ ] Test refresh flow

---

## Sprint 2 — Profil & Localisation (IV.2)
### Backend
- [ ] Endpoints `GET /me/viewers`, `GET /me/likers`
- [ ] Champs `online`, `last_seen_at`
- [ ] Middleware update “last_seen”

### Frontend
- [ ] UI sections “Qui m’a vu” / “Qui m’a liké”
- [ ] Indicateur “online / last seen” affiché sur cartes & profil
- [ ] Edition profil (bio, tags, photos)

### Intégration
- [ ] Vérifier synchro online/last seen côté FE
- [ ] Vérifier cohérence viewers/likers list

---

## Sprint 3 — Découverte & Recherche (IV.3–IV.4)
### Backend
- [ ] Optimiser SQL (index distance, tags)
- [ ] Implémenter “common tags” score

### Frontend
- [ ] UI Discover : filtres avancés (sliders âge/fame, select tags)
- [ ] UI Search : affichage résultats avec score tags communs

### Intégration
- [ ] Vérifier cohérence entre Discover & Search (même contrat)
- [ ] Tester perfs avec 500 profils seedés

---

## Sprint 4 — Vue Profil & Actions (IV.5)
### Backend
- [ ] Validation Like (refus si pas de photo profil)
- [ ] Log visites (profile_views table)
- [ ] Générer notifs visite/like

### Frontend
- [ ] UI Like/Unlike (toggle state)
- [ ] Indication “match” si like réciproque
- [ ] Boutons Block/Report (toast confirmation)

### Intégration
- [ ] Vérifier enchaînement visite → notif visite
- [ ] Vérifier unlike → suppression match

---

## Sprint 5 — Chat & Notifications (IV.6–IV.7)
### Backend
- [ ] Générer notifs (LIKE, VISIT, MESSAGE, MATCH, UNLIKE)
- [ ] API `POST /notifications/:id/read`

### Frontend
- [ ] UI badge non lus global
- [ ] Panneau Notifications (liste + marquer lu)
- [ ] Page Chat : support non lus, scroll auto

### Intégration
- [ ] Vérifier synchro chat ↔ notifs
- [ ] Vérifier que unlike coupe le flux messages
