# https://www.digitalocean.com/community/tutorials/how-to-build-and-deploy-a-node-js-application-to-digitalocean-kubernetes-using-semaphore-continuous-integration-and-delivery
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "dist/app.js" ]