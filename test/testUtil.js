// Apollo imports
const { ApolloClient } = require("apollo-client"); // Base Apollo
const { InMemoryCache } = require("apollo-cache-inmemory"); // Local Cache Storage
const { ApolloLink, split } = require("apollo-link"); // Handles and manages the differnet apollo-link packages
const { getMainDefinition } = require("apollo-utilities"); // Aids with splitting links
const { HttpLink } = require("apollo-link-http"); // Use Apollo Over HTTP (Queries, Mutations)
const { WebSocketLink } = require("apollo-link-ws"); // Use Apollo Over Websockets (Subscriptions)

const getApolloClient = () => {
  let serverName = "localhost";
  if (process.env.SERVER_HOST) {
    serverName = process.env.SERVER_HOST;
  }

  // Create an http link:
  const httpLink = new HttpLink({
    uri: "http://" + serverName + ":4001/graphql"
  });

  // Create a WebSocket link:
  const wsLink = new WebSocketLink({
    uri: `ws://${serverName}:4001/subscriptions`,
    options: {
      reconnect: true
    }
  });

  // This link will handle sending out HTTP and WS requests
  const HTTP_WS_LINK = split(
    // Split the links so your query and mutations go to the apollo-link-http while subscriptions go to apollo-link-ws
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === "OperationDefinition" && operation === "subscription";
    },
    wsLink,
    httpLink
  );

  const CACHE = new InMemoryCache();

  // Point appolo towards graphql server
  const client = new ApolloClient({
    link: ApolloLink.from([
      //STATE_LINK,
      HTTP_WS_LINK
    ]),
    cache: CACHE
  });

  return client;
};

module.exports = { getApolloClient };
