FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3003

CMD [ "npx", "prisma", "migrate", "deploy" ]
CMD [ "node", "src/index.js" ]
