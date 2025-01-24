FROM node

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm i -f

RUN npm run build

CMD [ "npm", "run", "start:prod" ]