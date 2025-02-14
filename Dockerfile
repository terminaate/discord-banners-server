FROM node:alpine

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm i -f

RUN npm run build

CMD [ "npm", "run", "start:prod" ]
