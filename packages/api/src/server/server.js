const typeDefs = require("./typeDefs");
const resolversFactory = require("./resolversFactory");
const Debug = require("debug").default;
const { ApolloServer } = require("apollo-server-express");
const http = require("http"); // Library to create an http server
const express = require("express"); // NodeJS Web Server
const cors = require("cors"); // Cross Origin Resource Sharing Middleware
const helmet = require("helmet"); // Security Middleware
const compression = require("compression"); // Compression Middleware
const debug = Debug("server");

const start = options => {
  return new Promise((resolve, reject) => {
    if (!options.port) {
      reject(new Error("The server must be started with an available port"));
    }

    if (!options.service) {
      reject(new Error("The server must be started with a connected service"));
    }

    const app = express();
    const resolvers = resolversFactory(options.service);
    const apolloServer = new ApolloServer({ typeDefs, resolvers });

    // Apply middleware to Express app
    app.use("*", cors());
    app.use(helmet());
    app.use(compression());
    apolloServer.applyMiddleware({ app });

    // Create the httpServer and add subscriptions
    const httpServer = http.createServer(app);
    apolloServer.installSubscriptionHandlers(httpServer);

    // Start the httpServer
    const apolloApp = httpServer.listen(options.port, () => {
      resolve({
        app: apolloApp,
        port: options.port,
        gqlPath: apolloServer.graphqlPath,
        subscriptionsPath: apolloServer.subscriptionsPath
      });
    });
  });
};

module.exports = Object.assign({}, { start });
