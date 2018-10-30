const { ApolloServer } = require("apollo-server-express");
const http = require("http"); // Library to create an http server
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const makeApolloServer = (app, options) => {
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  apolloServer.applyMiddleware({ app });
  const httpServer = http.createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);
  httpServer.graphqlPath = apolloServer.graphqlPath;
  httpServer.subscriptionsPath = apolloServer.subscriptionsPath;
  return httpServer;
};

module.exports = Object.assign({}, { makeApolloServer });
