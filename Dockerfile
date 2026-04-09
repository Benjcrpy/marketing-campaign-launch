FROM node:20-alpine

WORKDIR /work

ENV NODE_ENV=production \
    WORKDIR=/work

COPY package.json package-lock.json* ./
RUN npm install

COPY next.config.js ./
COPY app ./app
COPY lib ./lib
COPY agents ./agents

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

