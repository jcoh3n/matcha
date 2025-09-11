# Matcha

## Description
**Matcha** est un projet de site de rencontre développé dans le cadre du cursus post tronc-commun de l’école 42.  
L’application couvre l’ensemble du parcours utilisateur : de l’inscription à la mise en relation, avec un système de profils détaillés, de recherche avancée, de matching, de chat en temps réel et de notifications.  

## Architecture
Le projet est organisé en deux parties distinctes :
- `frontend/` : Application React avec Vite
- `backend/` : API REST avec Node.js/Express

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
3. Configurer les variables d’environnement dans `backend/.env`.  
4. Lancer le projet avec Docker Compose :  
   ```bash
   docker-compose up -d
   ```
5. Exécuter les migrations de base de données :  
   ```bash
   # Attendre que PostgreSQL soit prêt, puis exécuter :
   docker exec matcha_backend npm run migrate
   ```

## Configuration du développement
Pour plus d'informations sur la configuration du développement, y compris la résolution des problèmes courants, consultez [SETUP.md](SETUP.md).

## Contributeurs
- [@me](https://github.com/me)  
- [@demsCod](https://github.com/demsCod)