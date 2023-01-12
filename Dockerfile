FROM node:18-alpine
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN npm install -g @nestjs/cli
RUN mkdir -p /var/www/customer
WORKDIR /var/www/customer
ADD . /var/www/customer
# RUN npm install
CMD npm start