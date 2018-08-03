const typeDefs = require("./typeDefs").default;
const resolvers = require("./resolvers").default;
const MockLight = require("./components/LightService/Mocks/MockLight").default;
const Debug = require("debug").default;
const { ApolloServer } = require("apollo-server-express");
const http = require("http"); // Library to create an http server
const express = require("express"); // NodeJS Web Server
const cors = require("cors"); // Cross Origin Resource Sharing Middleware
const helmet = require("helmet"); // Security Middleware
const compression = require("compression"); // Compression Middleware

console.log("TODO: Upgrade to use ReactiveX JS");
const debug = Debug("server");

const GRAPHQL_PORT = 4001; // Default Server Port
const app = express(); // Express App
const server = new ApolloServer({ typeDefs, resolvers }); // Apollo Server Constructor

// Apply middleware to Express app
app.use("*", cors());
app.use(helmet());
app.use(compression());
server.applyMiddleware({ app });

// Create the httpServer and add subscriptions
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

// Start the httpServer
httpServer.listen(GRAPHQL_PORT, () => {
  debug(
    `🚀 Server ready at http://localhost:${GRAPHQL_PORT}${server.graphqlPath}`
  );
  debug(
    `🚀 Subscriptions ready at ws://localhost:${GRAPHQL_PORT}${
      server.subscriptionsPath
    }`
  );
});

// TODO: add to util file
const createMockLight = mockName => {
  debug(`Starting ${mockName} as a mock light`);
  const mockLight = new MockLight(mockName);
  mockLight.subscribeToCommands();
  mockLight.publishConnected({ name: mockName, connection: 2 });
  mockLight.publishEffectList({
    name: mockName,
    effectList: ["Test 1", "Test 2", "Test 3"]
  });
  mockLight.publishState({
    name: mockName,
    state: "OFF",
    color: { r: 255, g: 100, b: 0 },
    brightness: 100,
    effect: "None",
    speed: 4
  });
};

// Create one default mock light
createMockLight("Default Mock");

// Set up any extra mock lights if the environment dictates it
if (process.env.MOCKS) {
  const mockArray = process.env.MOCKS.split(",");
  mockArray.forEach(createMockLight);
}
