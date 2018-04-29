# The latest LTS version of node
FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Add app
COPY . .

# Install app dependencies
RUN yarn install

# Build app
RUN yarn build

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Start the app
CMD ["yarn", "start"]


# Build command
# docker build -t lightapp2-client .

# Run command
# docker run -it -p 3000:3000 lightapp2-client

# Development run command
# docker run -it -p 3000:3000 --mount type=bind,source="$(pwd)",target=/usr/src/app lightapp2-client