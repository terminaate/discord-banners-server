FROM node:alpine AS base

WORKDIR /app

COPY package*.json ./

COPY . .

#  add libraries; sudo so non-root user added downstream can get sudo
RUN apk add \
    sudo \
    curl \
    build-base \
    g++ \
    libpng \
    libpng-dev \
    jpeg-dev \
    pango-dev \
    cairo-dev \
    giflib-dev \
    python3 \
    gcompat \
    librsvg-dev

RUN npm i

RUN npm run build

CMD [ "npm", "run", "start:prod" ]