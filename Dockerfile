# build environment
FROM node:9.6.1 as builder
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json /usr/src/app/package.json
RUN yarn install --silent
RUN yarn global add react-scripts@1.1.1 --silent
COPY . /usr/src/app
RUN yarn build

# production environment
FROM arm32v7/nginx:stable
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Run prod build
# docker build -f Dockerfile-prod -t lightapp2-client-prod .

# Run prod
# docker run -it -p 80:80 --rm lightapp2-client-prod