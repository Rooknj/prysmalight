## Build Environment
# The latest LTS version of node
FROM arm32v7/node:9.11-stretch as builder

# Create app directory
WORKDIR /usr/src/app

ENV NODE_ENV="production"
ENV BABEL_ENV="production"

# Add app
COPY . .

# Install app dependencies
RUN yarn install --silent

# Install pkg
RUN yarn global add pkg

# Build app
RUN yarn build
RUN pkg . --targets node8-linux-armv7

CMD ["yarn", "prodServer"]

## Prod Environment
FROM resin/rpi-raspbian:jessie

RUN apt-get update && \
    apt-get upgrade -y 

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/lightapp2-server /usr/src/app

# Make port 4001 available to the world outside this container
EXPOSE 4001

# Start the app
CMD ./lightapp2-server