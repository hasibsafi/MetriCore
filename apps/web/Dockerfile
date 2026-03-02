FROM node:20-alpine

WORKDIR /workspace

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY . .

RUN npm run -w apps/web prisma:generate

EXPOSE 3000

CMD ["npm", "run", "-w", "apps/web", "dev"]
