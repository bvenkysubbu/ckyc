# specify the node base image with your desired version node:<version>
FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# If you are building your code for production
# RUN npm install --only=production

EXPOSE 8080
EXPOSE 22
CMD [ "npm", "start" ]
