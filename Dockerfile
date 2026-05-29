
FROM node:26-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

# STAGE 2: PRODUCTION RUNTIME ENVIRONMENT

FROM node:26-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./

RUN npm ci --only=production

COPY server.js ./
COPY public/ ./public/

RUN touch tasks.json && chown -R node:node /usr/src/app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["npm", "start"]


