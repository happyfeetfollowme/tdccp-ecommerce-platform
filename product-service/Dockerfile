FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3002

CMD [ "npx", "prisma", "migrate", "deploy" ]
CMD [ "node", "src/index.js" ]
