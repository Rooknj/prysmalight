// React Import
import React from "react";
import ReactDOM from "react-dom";

// Local Imports
import App from "./App";

// Service Worker Import
import registerServiceWorker from "./registerServiceWorker";

// Apollo imports
import { ApolloClient } from "apollo-client"; // Base Apollo
import { ApolloProvider } from "react-apollo"; // Connect Apollo to React
import { InMemoryCache } from "apollo-cache-inmemory"; // Local Cache Storage
import { ApolloLink, split } from "apollo-link"; // Handles and manages the differnet apollo-link packages
import { onError } from "apollo-link-error"; // Do custom logic when a GraphQL or network error occurs
import { getMainDefinition } from "apollo-utilities"; // Aids with splitting links
import { HttpLink } from "apollo-link-http"; // Use Apollo Over HTTP (Queries, Mutations)
import { WebSocketLink } from "apollo-link-ws"; // Use Apollo Over Websockets (Subscriptions)

let serverName;
if (process.env.REACT_APP_ENV === "dev") {
  serverName = "prysma.local";
} else if (process.env.REACT_APP_ENV === "dev-local") {
  serverName = "localhost";
} else {
  serverName = window.location.hostname;
}

// Create an http link:
const httpLink = new HttpLink({
  uri: "http://" + serverName + ":4001/graphql"
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: "ws://" + serverName + ":4001/graphql",
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

// This link does custom logic when a GraphQL or network error occurs
const ON_ERROR_LINK = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const CACHE = new InMemoryCache();

// Point appolo towards graphql server
const client = new ApolloClient({
  link: ApolloLink.from([
    ON_ERROR_LINK,
    //STATE_LINK,
    HTTP_WS_LINK
  ]),
  cache: CACHE
});

// Render React App on the DOM
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// Start Service Worker
registerServiceWorker();
