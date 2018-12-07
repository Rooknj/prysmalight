## Build Environment
# The latest LTS version of node
FROM node:carbon-alpine as builder

# Create app directory
WORKDIR /usr/app

ENV PKG_TARGET="node8-linux-x64"

# Add app
COPY . .

# Install pkg
RUN yarn global add pkg

# Install app dependencies
RUN yarn install --silent
 # Test app
RUN yarn test --no-watch

# Build app
RUN yarn build

## Prod Environment
FROM node:carbon

WORKDIR /usr/app

COPY --from=builder /usr/app/build/lightapp2-controller-microservice /usr/app

# Start the app
CMD ./lightapp2-controller-microservice