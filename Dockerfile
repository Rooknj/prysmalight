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

# Build command
# docker build -t lightapp2-server .

# Run command
# docker run -it -p 4001:4001 lightapp2-server

# Development run command
# docker run -it -p 4001:4001 --mount source="$(pwd)",target=/usr/src/app lightapp2-server yarn devServer

# Run Mosquitto
# docker run -it -p 1883:1883 -p 9001:9001 -v mosquitto.conf:/mosquitto/config/mosquitto.conf -v /mosquitto/data -v /mosquitto/log eclipse-mosquitto