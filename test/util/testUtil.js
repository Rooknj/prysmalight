// Apollo imports
const { ApolloClient } = require("apollo-client"); // Base Apollo
const { InMemoryCache } = require("apollo-cache-inmemory"); // Local Cache Storage
const { ApolloLink, split } = require("apollo-link"); // Handles and manages the differnet apollo-link packages
const { getMainDefinition } = require("apollo-utilities"); // Aids with splitting links
const fetch = require('node-fetch').default; // Required for HttpLink to work in node
const { HttpLink } = require("apollo-link-http"); // Use Apollo Over HTTP (Queries, Mutations)
const ws = require('ws'); // Required for WebSocketLink to work in node
const { WebSocketLink } = require("apollo-link-ws"); // Use Apollo Over Websockets (Subscriptions)

const getApolloClient = () => {
  let serverName = "localhost";
  if (process.env.SERVER_HOST) {
    serverName = process.env.SERVER_HOST;
  }

  // Create an http link:
  const httpLink = new HttpLink({
    uri: "http://" + serverName + ":4001/graphql",
    fetch
  });

  // Create a WebSocket link:
  const wsLink = new WebSocketLink({
    uri: `ws://${serverName}:4001/subscriptions`,
    webSocketImpl: ws,
    options: {
      lazy: true, // This will make sure the websocket does not connect until a subscription is started
      timeout: 5000 // This will make sure to disconnect the websocket connection after 5 seconds of inactivity, thus ending the test
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
