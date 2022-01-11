FROM node:lts-alpine3.15 as build

WORKDIR /app
COPY package.json server-app.js ./
RUN npm install

FROM node:lts-alpine3.15

COPY --from=build /app /
EXPOSE 9001
CMD ["npm", "start"]