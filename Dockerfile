# The latest LTS version of node
FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Add app
COPY . .

# Install nodemon
RUN yarn global add nodemon --dev

# Install app dependencies
RUN yarn install

# Build app
RUN yarn build

# Make port 4001 available to the world outside this container
EXPOSE 4001

# Start the app
CMD ["yarn", "start"]

# Build command
# docker build -t lightapp2-server .

# Run command
# docker run -it -p 4001:4001 lightapp2-server

# Development run command
# docker run -it -p 4001:4001 -d --mount type=bind,source="$(pwd)",target=/usr/src/app lightapp2-server yarn devServer --ports "4001:4001"

