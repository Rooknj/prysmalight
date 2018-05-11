# The latest LTS version of node
FROM node:9.6.1

# Create app directory
WORKDIR /usr/src/app

# Add app
COPY . .

ENV NODE_ENV="development"
ENV BABEL_ENV="development"

# Install nodemon
RUN yarn global add nodemon --dev

# Install app dependencies
RUN yarn install

# Make port 4001 available to the world outside this container
EXPOSE 4001

# Start the app
CMD ["yarn", "start"]