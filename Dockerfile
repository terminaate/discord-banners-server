FROM node:alpine
LABEL authors="tntwn"

WORKDIR /usr/src/app

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

RUN npm i --force

RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "start:prod" ]