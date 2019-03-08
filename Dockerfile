## Build Environment
# The latest LTS version of node
FROM balenalib/armv7hf-node:10-stretch as builder

# Create app directory
WORKDIR /usr/app

ENV PKG_TARGET="node10-linux-armv7"

# Add app
COPY . .

# Start QEMU support for building on all architectures
RUN [ "cross-build-start" ]

# Install app dependencies
RUN npm install

# Test app
RUN npm run test -- --no-watch

# Install pkg and Build App
RUN npm run build

## Prod Environment
FROM balenalib/armv7hf:stretch-run

WORKDIR /usr/app

COPY --from=builder /usr/app/build/prysmalight /usr/app

# Make port 4001 available to the world outside this container
EXPOSE 4001

# Start the app
CMD ./prysmalight