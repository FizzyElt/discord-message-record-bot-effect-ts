FROM node:22.17.0-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install

CMD ["pnpm", "run", "start"]