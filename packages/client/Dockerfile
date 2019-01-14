## Build Environment
# The latest LTS version of node
FROM resin/raspberrypi3-node:8.11.3-slim as builder

# Create app directory
WORKDIR /usr/app

# Add app
COPY . .

# Start QEMU support for building on all architectures
RUN [ "cross-build-start" ]

# Install Yarn
RUN npm install -g yarn
# Add react-scripts
RUN yarn global add react-scripts@1.1.2 --silent
# Install app dependencies
RUN yarn install --silent
# Test app
RUN yarn test --no-watch

# Build app
RUN yarn build

# production environment
FROM arm32v7/nginx:stable
COPY --from=builder /usr/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]