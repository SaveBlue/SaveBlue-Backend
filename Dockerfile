# Build Stage
FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm i

# Bundle app source
COPY src .

EXPOSE 3000
CMD [ "node", "server.js" ]
