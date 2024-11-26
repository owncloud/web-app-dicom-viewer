FROM node:alpine AS stage

WORKDIR /extension

COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

FROM node:alpine
WORKDIR /app
COPY --from=stage /extension/dist ./ 
