FROM node:12.19.0

WORKDIR /app

COPY . /app

RUN npm install

CMD ["node", "app.js"]
