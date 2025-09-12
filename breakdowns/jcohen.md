# Plan de développement – jcohen

## État actuel
- [x] Sprint 0 – Socle (React/Tailwind + Express/Postgres + `/health`)
- [ ] Sprint 1 – Auth (reste à finir)

---

## Sprint 1 – Auth (à terminer)
- [ ] FE : Forgot/Reset password, guard routes privées, gestion refresh token
- [ ] BE : `POST /auth/logout`, erreurs normalisées (si manquant)
- [ ] DoD : Auth E2E complet (register/login/verify/reset/logout)

---

## Sprint 2 – Vue Profil & Actions Sociales
- [ ] API : `GET /profiles/:id` (infos publiques sans email/mdp), log visites
- [ ] API : `POST/DELETE /likes/:id` (refus si pas de photo profil)
- [ ] API : `POST /profiles/:id/block`, `POST /profiles/:id/report`
- [ ] FE : page Profil (galerie photos, bio, tags, fame, distance, online/last seen)
- [ ] FE : actions Like/Unlike, Block, Report, badges “vous a liké” / “match”
- [ ] DoD : visite enregistrée, règles like/unlike/blocked respectées

---

## Sprint 3 – Notifications Temps Réel
- [ ] DB : `notifications` (LIKE, VISIT, MESSAGE, MATCH, UNLIKE)
- [ ] API + WS : `notifications` namespace + REST `GET /notifications`, `POST /notifications/:id/read`
- [ ] FE : cloche + badge, panneau liste, marquer comme lu
- [ ] DoD : notif reçue ≤10s, unlike stoppe notifs

---

## Sprint 4 – “Qui m’a vu / Qui m’a liké” + Online
- [ ] API : `GET /me/viewers`, `GET /me/likers`
- [ ] API : MAJ `online` et `last_seen_at`
- [ ] FE : pages “Qui m’a vu” / “Qui m’a liké”, indicateurs online
- [ ] DoD : cohérence listes viewers/likers, affichage état online/last seen

---

## Sprint 5 – UI Avancée & Perfs
- [ ] FE : filtres avancés (sliders âge/fame, tags AND/OR, rayon km)
- [ ] FE : tri dynamique (visuel) vs filtres (réduction set)
- [ ] FE : perfs Discover/Search (infinite scroll, skeletons, memo)
- [ ] DoD : UX fluide avec 500 profils, 0 erreurs console

---

## Sprint 6 – Intégration finale
- [ ] Vérification contrats JSON avec mdembele
- [ ] Tests E2E : Register → Profil public → Like ↔ Like → Notifs
- [ ] Accessibilité (focus, contrastes)
