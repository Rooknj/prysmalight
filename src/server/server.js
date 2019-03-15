"use strict";
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const { ApolloServer } = require("apollo-server-express");
const http = require("http"); // Library to create an http server
const express = require("express"); // NodeJS Web Server
const cors = require("cors"); // Cross Origin Resource Sharing Middleware
const helmet = require("helmet"); // Security Middleware
const compression = require("compression"); // Compression Middleware

const createServer = ({ lightService }) => {
  let self = {};

  const app = express();
  const context = async ({ req }) => ({
    lightService,
    request: req
  });
  const apolloServer = new ApolloServer({ typeDefs, resolvers, context });

  // Apply middleware to Express app
  app.use("*", cors());
  app.use(helmet());
  app.use(compression());
  apolloServer.applyMiddleware({ app });

  // Create the httpServer and add subscriptions
  const httpServer = http.createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  const start = port => {
    // Start the httpServer
    return new Promise(resolve => {
      const apolloApp = httpServer.listen(port, () => {
        resolve({
          app: apolloApp,
          port,
          gqlPath: apolloServer.graphqlPath,
          subscriptionsPath: apolloServer.subscriptionsPath
        });
      });
    });
  };

  self = {
    start
  };

  return Object.create(self);
};

module.exports = createServer;
