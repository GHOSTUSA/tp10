FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

FROM node:20-alpine AS runner

WORKDIR /app

RUN chown node:node /app

COPY --from=builder --chown=node:node /app /app

USER node

EXPOSE 3000

CMD ["node", "serveur.js"]