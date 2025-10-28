# Version 4
FROM node:24-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:24-alpine AS final
WORKDIR /app
COPY --from=builder /app/dist .
COPY package.json ./
RUN npm install --only=production
CMD [ "node", "index.js" ]