FROM node:26.12.1-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@12.15.0

# 先只複製依賴描述檔，改程式碼時才不用重新安裝套件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:26.12.1-alpine

WORKDIR /app

ENV NODE_ENV=production

# dependencies 都已打包進 dist，不需要 node_modules
COPY --from=build /app/dist ./dist

USER node

CMD ["node", "dist/index.mjs"]
