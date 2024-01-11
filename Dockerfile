FROM node:20

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install

CMD ["pnpm", "run", "start"]