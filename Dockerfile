FROM owncloudci/nodejs:20 AS stage

WORKDIR /extension

COPY . .
RUN pnpm install
RUN pnpm build:prod

FROM alpine:3.20
WORKDIR /app
COPY --from=stage /extension/dist ./ 
