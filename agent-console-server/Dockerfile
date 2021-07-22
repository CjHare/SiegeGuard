## Stage one: build container
FROM node:12-alpine

WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build


## Stage two: production container
FROM node:12-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=0 /usr/src/app/dist /usr/src/app/dist
EXPOSE 3000
ENV NODE_ENV production
CMD node /usr/src/app/dist/server.js
