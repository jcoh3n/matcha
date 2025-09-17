# Implémentation de la barre de recherche

## Composants créés/modifiés

1. **SearchBar** (`/workspaces/matcha/app/frontend/src/components/ui/search-bar.tsx`)
   - Composant de base pour la recherche
   - Implémente une fonction de debounce personnalisée pour limiter les requêtes
   - Affiche un indicateur de chargement pendant la recherche
   - Utilise l'API existante pour effectuer les recherches

2. **SearchResults** (`/workspaces/matcha/app/frontend/src/components/ui/search-results.tsx`)
   - Composant qui affiche les résultats de recherche en temps réel
   - S'intègre sous la barre de recherche
   - Permet de naviguer vers le profil d'un utilisateur ou vers la page de recherche complète
   - Gère la fermeture des résultats lorsqu'on clique à l'extérieur

3. **Header** (`/workspaces/matcha/app/frontend/src/components/layout/Header.tsx`)
   - Intégration de la barre de recherche dans le header
   - Mise à jour de l'interface pour afficher la barre de recherche sur les écrans moyens et larges
   - Mise à jour des types pour gérer la navigation avec les résultats de recherche

4. **AppShell** (`/workspaces/matcha/app/frontend/src/components/layout/AppShell.tsx`)
   - Mise à jour pour gérer la navigation avec les résultats de recherche
   - Ajout de la fonction de navigation vers les profils et la page de recherche

5. **App** (`/workspaces/matcha/app/frontend/src/App.tsx`)
   - Ajout d'une route de test pour vérifier le fonctionnement de la recherche

## Fonctionnalités implémentées

1. **Recherche en temps réel**
   - Les résultats s'affichent automatiquement pendant que l'utilisateur tape
   - Délai de debounce de 300ms pour limiter les requêtes
   - Indicateur de chargement pendant la recherche

2. **Affichage des résultats**
   - Résultats affichés dans un dropdown sous la barre de recherche
   - Affichage des profils avec les informations essentielles
   - Limitation à 5 résultats dans le dropdown
   - Lien vers la page de recherche complète pour voir tous les résultats

3. **Navigation**
   - Navigation vers le profil d'un utilisateur en cliquant sur un résultat
   - Navigation vers la page de recherche complète
   - Navigation vers la page de recherche avec le terme de recherche

4. **Responsive**
   - Barre de recherche masquée sur mobile (comme dans le design original)
   - Interface adaptée aux différentes tailles d'écran

## Communication front/back

1. **API existante utilisée**
   - Route : `GET /api/discovery/search`
   - Paramètres : `query`, `limit`, `offset`
   - Authentification : Bearer token

2. **Gestion des erreurs**
   - Gestion des erreurs réseau
   - Gestion des erreurs d'authentification
   - Affichage de messages d'erreur appropriés

3. **Optimisations**
   - Fonction de debounce personnalisée (pas de dépendance externe)
   - Limitation du nombre de résultats affichés dans le dropdown
   - Fermeture automatique des résultats lorsqu'on clique à l'extérieur

## Test

Une page de test a été créée pour vérifier le bon fonctionnement de la recherche :
- URL : `/test-search`
- Permet de tester la barre de recherche dans le header
- Permet de tester le composant de recherche autonome