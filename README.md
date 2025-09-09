# Matcha

## Description
**Matcha** est un projet de site de rencontre développé dans le cadre du cursus de l’école 42.  
L’application couvre l’ensemble du parcours utilisateur : de l’inscription à la mise en relation, avec un système de profils détaillés, de recherche avancée, de matching, de chat en temps réel et de notifications.  

## Fonctionnalités
- Inscription et connexion sécurisées (email de vérification, mot de passe chiffré, reset password).  
- Gestion de profil utilisateur (genre, préférences, biographie, tags, photos).  
- Système de matching basé sur la localisation, les centres d’intérêt et un indicateur de réputation ("fame rating").  
- Recherche avancée avec filtres (âge, localisation, tags, réputation).  
- Consultation des profils avec options : like/unlike, blocage, signalement, statut en ligne.  
- Chat en temps réel entre profils connectés par un like réciproque.  
- Notifications en temps réel (likes, messages, visites de profil, etc.).  

## Stack utilisée
- **Backend** : Node.js, Express  
- **Frontend** : React  
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
   npm install
   ```
3. Configurer les variables d’environnement dans un fichier `.env`.  
4. Lancer le projet :  
   ```bash
   npm run dev
   ```

## Contributeurs
- [@me](https://github.com/me)  
- [@demsCod](https://github.com/demsCod)  
