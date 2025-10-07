# Étape 1 : Build minimal du serveur Node.js
FROM node:18-alpine AS builder

# Crée un répertoire de travail
WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe uniquement les dépendances nécessaires pour la prod
RUN npm install --omit=dev

# Copie le reste du code du projet
COPY . .

# Étape 2 : Image finale (légère)
FROM node:18-alpine

WORKDIR /app

# Copie les fichiers depuis l'étape précédente
COPY --from=builder /app /app

# Définit le port exposé
ENV PORT=8080
EXPOSE 8080

# Commande de démarrage
CMD ["node", "server.js"]
