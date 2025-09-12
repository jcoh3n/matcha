# Plan de développement – mdembele

## État actuel
- [x] Sprint 0 – Socle (React/Tailwind + Express/Postgres + `/health`)
- [x] Sprint 1 – Auth (register/login/verify/reset, pages FE, JWT)

---

## Sprint 2 – Onboarding Profil
- [ ] DB : tables `profiles`, `tags`, `user_tags`, `photos`, `locations`
- [ ] API : `GET/PUT /me`, `GET/POST/DELETE /me/tags`
- [ ] API : `POST /me/photos`, `PUT /me/photos/:id/profile`, `DELETE /me/photos/:id`
- [ ] API : `PUT /me/location` (GPS, IP, manuel)
- [ ] FE : page Onboarding (bio, orientation, tags, upload 1–5 photos, localisation)
- [ ] DoD : édition profil complète, 3 modes de localisation OK, 5 photos max

---

## Sprint 3 – Découverte & Recherche
- [ ] API : `GET /suggested` (tri + filtres âge, distance, fame, tags)
- [ ] API : `GET /search` (mêmes critères)
- [ ] Logique orientation (par défaut bi), exclusion bloqués/inactifs
- [ ] FE : page Discover (cartes style Tinder : photo, âge, distance, fame, tags)
- [ ] FE : page Search (formulaire multi-critères + résultats)
- [ ] DoD : tri ≠ filtre validés, pagination/infinite scroll OK

---

## Sprint 4 – Fame Rating + Seed 500
- [ ] Service `fame` : calcul (likes reçus, vues, activité 30j) clampé 0–100
- [ ] Hooks : MAJ sur like/visit/activity
- [ ] Cron : recalcul batch
- [ ] Script seed : 500 users (faker/randomuser), 1–5 photos, tags (~50), positions
- [ ] DoD : dataset prêt pour soutenance, perfs OK Discover/Search

---

## Sprint 5 – Chat Temps Réel
- [ ] DB : `matches`, `messages`
- [ ] Match : création auto à like réciproque
- [ ] API + WS : `chat` namespace (JWT handshake) + fallback REST/polling
- [ ] FE : liste conversations + vue conversation + gestion non-lus
- [ ] DoD : réception message ≤10s, unlike coupe chat

---

## Sprint 6 – Intégration finale
- [ ] Vérification contrats JSON avec jcohen
- [ ] Tests E2E : Register → Onboarding → Discover → Match → Chat
- [ ] Hardening sécurité (rate-limit, validation inputs, uploads)
