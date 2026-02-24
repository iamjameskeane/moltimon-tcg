FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

RUN mkdir -p /data

ENV NODE_ENV=production
ENV DB_PATH=/data/moltimon.db

EXPOSE 3000

CMD ["node", "dist/index.js"]