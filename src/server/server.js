const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
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

    const app = express();
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
    const server = httpServer.listen(options.port, () => {
      debug(
        `🚀 Server ready at http://localhost:${options.port}${
          apolloServer.graphqlPath
        }`
      );
      debug(
        `🚀 Subscriptions ready at ws://localhost:${options.port}${
          apolloServer.subscriptionsPath
        }`
      );

      resolve(server);
    });
  });
};

module.exports = Object.assign({}, { start });
