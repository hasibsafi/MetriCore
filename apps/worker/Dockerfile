FROM node:20-alpine

WORKDIR /workspace

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/worker/package*.json ./apps/worker/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY . .

RUN npm run -w apps/web prisma:generate

CMD ["npm", "run", "-w", "apps/worker", "dev"]
