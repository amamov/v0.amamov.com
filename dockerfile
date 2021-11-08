FROM node:14.17

WORKDIR /usr/app

RUN npm i -g npm 
RUN npm i -g pm2 @nestjs/cli
COPY ./package*.json ./
RUN npm i
COPY ./ ./
RUN npm run build

EXPOSE 5500

CMD [ "pm2-runtime", "start", "npm", "--", "start:prod" ]