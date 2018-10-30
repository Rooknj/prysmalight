const { ApolloServer } = require("apollo-server-express");
const http = require("http"); // Library to create an http server
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const makeApolloServer = (app, options) => {
  console.log(options.repo.getLight);
  console.log(options.msgr.subscribeToLight);
  // Generate the apolloServer and apply the middleware to the express app
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  apolloServer.applyMiddleware({ app });

  // Create an httpServer using the apolloServer and add subscription support
  const httpServer = http.createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  // Pass along some data
  httpServer.graphqlPath = apolloServer.graphqlPath;
  httpServer.subscriptionsPath = apolloServer.subscriptionsPath;
  return httpServer;
};

module.exports = Object.assign({}, { makeApolloServer });
