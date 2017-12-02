FROM node:8

MAINTAINER "Pontus Alexander <pontus.alexander@gmail.com>"

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm install

COPY public/ ./public
COPY server/ ./server

EXPOSE 8080

ENV PORT=8080

CMD ["npm", "start"]
