import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

//Apollo import
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";

//importing apollo cache fragment matching (get rid of heuristic errors)
//import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';

//This is the schema file imported by running node getFragmentSchema.js
//You should run getFragmentSchema.js every time the schema changes so it is
//a good idea to run that as part of the build step/command
//import introspectionQueryResultData from './fragmentTypes.json';

//The link which makes each GraphQL call seperate
import { HttpLink } from "apollo-link-http";
//Allows you to combine your GraphQL calls into one (any calls made within 10ms are batched together)
//import { BatchHttpLink } from "apollo-link-batch-http"; //use instead of HttpLink
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
//instantiate the fragment matcher
//const fragmentMatcher = new IntrospectionFragmentMatcher({
//  introspectionQueryResultData
//});

// Create an http link:
const httpLink = new HttpLink({
  uri: "http://localhost:4001/graphql"
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4001/subscriptions`,
  options: {
    reconnect: true
  }
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

//Point appolo towards graphql server
const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache() //add the fragment matcher to the cache
  //cache: new InMemoryCache({ fragmentMatcher }), //add the fragment matcher to the cache
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

registerServiceWorker();
