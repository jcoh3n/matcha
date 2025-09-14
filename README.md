# Matcha

## Description
**Matcha** est un projet de site de rencontre développé dans le cadre du cursus post tronc-commun de l’école 42.  
L’application couvre l’ensemble du parcours utilisateur : de l’inscription à la mise en relation, avec un système de profils détaillés, de recherche avancée, de matching, de chat en temps réel et de notifications.  

## Architecture
Le projet est organisé en deux parties distinctes :
- `app/frontend/` : Application React avec Vite
- `app/backend/` : API REST avec Node.js/Express

## Stack utilisée
- **Backend** : Node.js, Express  
- **Frontend** : React, Tailwind
- **Base de données** : PostgreSQL  
- **Authentification et sécurité** : JWT, bcrypt, validation des entrées  
- **Temps réel** : Socket.IO  
- **Serveur web** : Nginx  
- **Autres** : dotenv, responsive design  

## Installation
1. Cloner le dépôt :  
   ```bash
   git clone https://github.com/<user>/<repo>.git
   cd <repo>
   ```
2. Installer les dépendances :  
   ```bash
   npm run install:all
   ```
3. Configurer les variables d'environnement dans `app/backend/.env`.  

## Lancement du projet

### Via Docker (recommandé pour l'exécution et la production) :

1. Nettoyer l'environnement Docker (optionnel mais recommandé) :
   ```bash
   # Arrêter et supprimer tous les conteneurs
   docker stop $(docker ps -aq)
   docker rm $(docker ps -aq)
   
   # Supprimer les volumes et réseaux inutilisés
   docker volume prune -f
   docker network prune -f
   
   # Supprimer les images non utilisées (optionnel)
   docker image prune -f
   ```

2. Lancer le projet :
   ```bash
   docker-compose up -d
   ```

3. Accéder à l'application :
   - Frontend : http://localhost:5173
   - Backend API : http://localhost:3000
   - Base de données : localhost:5432 (PostgreSQL)

4. Arrêter le projet :
   ```bash
   docker-compose down
   ```

### Via npm run dev (pour le développement) :

1. Dans un terminal, lancer le backend :
   ```bash
   cd backend
   npm run dev
   ```

2. Dans un autre terminal, lancer le frontend :
   ```bash
   cd frontend
   npm run dev
   ```

3. Accéder à l'application :
   - Frontend : http://localhost:5173
   - Backend API : http://localhost:3000

4. Arrêter les services : utiliser `Ctrl+C` dans chaque terminal

## Initialisation de la base de données

Lors du premier lancement du projet, la base de données doit être initialisée avec les tables et les données de test :

### Via Docker :
L'initialisation est automatique lors du premier lancement. Les scripts de migration et de seeding sont exécutés automatiquement.

### Manuellement (en développement) :
```bash
# Lancer les migrations
npm run migrate

# Insérer les données de test
npm run seed
```

## Configuration du développement
Pour plus d'informations sur la configuration du développement, y compris la résolution des problèmes courants, consultez [SETUP.md](SETUP.md).

## Contributeurs
- [@me](https://github.com/me)  
- [@demsCod](https://github.com/demsCod)