FROM node:24.18-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install

CMD ["pnpm", "run", "start"]