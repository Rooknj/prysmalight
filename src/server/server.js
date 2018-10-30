const Debug = require("debug").default;
const express = require("express"); // NodeJS Web Server
const cors = require("cors"); // Cross Origin Resource Sharing Middleware
const helmet = require("helmet"); // Security Middleware
const compression = require("compression"); // Compression Middleware
const debug = Debug("server");
const { makeApolloServer } = require("../api/api");

const start = options => {
  return new Promise((resolve, reject) => {
    if (!options.port) {
      reject(new Error("The server must be started with an available port"));
    }

    const app = express();

    // Apply middleware to Express app
    app.use("*", cors());
    app.use(helmet());
    app.use(compression());

    // Make the apollo server
    const apolloServer = makeApolloServer(app);

    // Start the httpServer
    const serverConnection = apolloServer.listen(options.port, () => {
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

      resolve(serverConnection);
    });
  });
};

module.exports = Object.assign({}, { start });
