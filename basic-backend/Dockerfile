FROM node:20-alpine as builder

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./tsconfig.json ./
RUN npm install 

COPY . .
RUN npm run build

FROM node:20-alpine 

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
ENTRYPOINT ["node", "./dist/main.js"]