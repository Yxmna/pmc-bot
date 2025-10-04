# PMC Bot

Bot Discord pour valider les comptes Minecraft des joueurs et leur attribuer automatiquement le rôle "Joueur".

## Prérequis

- Node.js 18+ (sans Docker)
- Docker et Docker Compose (avec Docker)
- Un bot Discord configuré sur le [Discord Developer Portal](https://discord.com/developers/applications)
- Les IDs des canaux et rôles de votre serveur Discord

## Configuration

### 1. Créer le bot Discord

1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Dans l'onglet "Bot", créez un bot et copiez le token
4. Activez les intents :
   - `GUILDS` (Server Members Intent)
   - `GUILD_MEMBERS` (Server Members Intent)
5. Dans l'onglet "OAuth2 > URL Generator" :
   - Sélectionnez scope : `bot`
   - Permissions : `Manage Roles`, `Manage Nicknames`, `Send Messages`, `Read Messages/View Channels`
   - Utilisez l'URL générée pour inviter le bot sur votre serveur

### 2. Récupérer les IDs Discord

Activez le mode développeur Discord (Paramètres > Avancés > Mode développeur), puis faites clic droit sur :
- Le canal de bienvenue → Copier l'identifiant → `WELCOME_CHANNEL_ID`
- Le canal des logs → Copier l'identifiant → `LOGS_CHANNEL_ID`
- Le rôle "Joueur" → Copier l'identifiant → `JOUEUR_ROLE_ID`

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
DISCORD_TOKEN=votre_token_discord
WELCOME_CHANNEL_ID=123456789012345678
LOGS_CHANNEL_ID=123456789012345678
JOUEUR_ROLE_ID=123456789012345678
```

## Installation sur Debian (sans Docker)

### Installation des dépendances

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Node.js 20.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérification
node --version
npm --version
```

### Déploiement du bot

```bash
# Cloner le projet
git clone <url-du-repo> pmc-bot
cd pmc-bot

# Installation des dépendances
npm install

# Configuration
nano .env  # Éditez avec vos valeurs

# Build
npm run build

# Test
npm start
```

### Exécution en service systemd

Créez `/etc/systemd/system/pmc-bot.service` :

```ini
[Unit]
Description=PMC Discord Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/votre-user/pmc-bot
ExecStart=/usr/bin/node /home/votre-user/pmc-bot/dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Activation du service :

```bash
# Recharger systemd
sudo systemctl daemon-reload

# Activer et démarrer le service
sudo systemctl enable pmc-bot
sudo systemctl start pmc-bot

# Vérifier le statut
sudo systemctl status pmc-bot

# Consulter les logs
sudo journalctl -u pmc-bot -f
```

## Installation avec Docker

### Option 1 : Docker simple

Créez un `Dockerfile` :

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

CMD ["node", "dist/index.js"]
```

Build et lancement :

```bash
# Build
docker build -t pmc-bot .

# Lancement
docker run -d \
  --name pmc-bot \
  --restart unless-stopped \
  --env-file .env \
  pmc-bot
```

### Option 2 : Docker Compose (recommandé)

Créez un `docker-compose.yml` :

```yaml
version: '3.8'

services:
  bot:
    build: .
    container_name: pmc-bot
    restart: unless-stopped
    env_file:
      - .env
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Créez le `Dockerfile` (même contenu que ci-dessus).

Lancement :

```bash
# Installer Docker Compose si nécessaire
sudo apt install docker-compose -y

# Build et démarrage
docker-compose up -d

# Consulter les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Redémarrer après modifications
docker-compose up -d --build
```

### Gestion du service Docker

```bash
# Voir les logs
docker logs pmc-bot -f

# Redémarrer
docker restart pmc-bot

# Arrêter
docker stop pmc-bot

# Supprimer
docker rm pmc-bot
```

## Mise à jour

### Sans Docker

```bash
cd pmc-bot
git pull
npm install
npm run build
sudo systemctl restart pmc-bot
```

### Avec Docker Compose

```bash
cd pmc-bot
git pull
docker-compose up -d --build
```

## Développement local

```bash
# Installation
npm install

# Lancement en mode watch
npm run dev
```

## Dépannage

### Le bot ne démarre pas

- Vérifiez que toutes les variables d'environnement sont définies : `cat .env`
- Vérifiez les logs : `sudo journalctl -u pmc-bot -n 50` ou `docker logs pmc-bot`

### Le bot ne répond pas

- Vérifiez que le bot a les permissions nécessaires sur Discord
- Vérifiez que les intents sont activés dans le Developer Portal
- Assurez-vous que le rôle du bot est supérieur au rôle "Joueur" dans la hiérarchie

### Erreur Mojang API

- L'API Mojang peut être temporairement indisponible, le bot réessaiera automatiquement
- Timeout configuré à 5 secondes

## Structure du projet

```
src/
├── index.ts              # Point d'entrée
├── config.ts             # Validation des variables d'environnement
├── constants.ts          # Constantes (IDs, couleurs, regex)
├── handlers/
│   ├── welcome.ts        # Gestion des nouveaux membres
│   └── interactions.ts   # Gestion des boutons/modals
├── mojang.ts             # API Mojang
├── logger.ts             # Système de logs Discord
├── ui.ts                 # Composants Discord (boutons, modals)
├── strings.ts            # Système i18n
└── texts.json            # Textes du bot
```
