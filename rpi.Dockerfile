## Build Environment
# The latest LTS version of node
FROM resin/raspberrypi3-node:8.11.3-slim as builder

# Create app directory
WORKDIR /usr/src/app

ENV NODE_ENV="production"
ENV BABEL_ENV="production"

# Add app
COPY . .

# Start QEMU support for building on all architectures
RUN [ "cross-build-start" ]

# Install Yarn
RUN npm install -g yarn

# Install pkg
RUN yarn global add pkg

# Install app dependencies
RUN yarn install --silent

# Build app
RUN yarn build
RUN pkg . --targets node8-linux-armv7

CMD ["yarn", "prodServer"]

## Prod Environment
FROM resin/raspberrypi3-debian:jessie

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/lightapp2-server /usr/src/app

# Make port 4001 available to the world outside this container
EXPOSE 4001

# Start QEMU support for building on all architectures
RUN [ "cross-build-start" ]

# Start the app
CMD ./lightapp2-server