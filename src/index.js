// React Import
import React from "react";
import ReactDOM from "react-dom";

// Local Imports
import "./index.css";
import App from "./App";

// Service Worker Import
import registerServiceWorker from "./registerServiceWorker";

// Apollo imports
import { ApolloClient } from "apollo-client"; // Base Apollo
import { ApolloProvider } from "react-apollo"; // Connect Apollo to React
import { InMemoryCache } from "apollo-cache-inmemory"; // Local Cache Storage
import { HttpLink } from "apollo-link-http"; // Use Apollo Over HTTP
import { WebSocketLink } from "apollo-link-ws"; // Use Apollo Over Websockets (Subscriptions)
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { split } from "apollo-link"; // Enables You to Send Apollo Web Traffic Over HTTP and Websockets
import { getMainDefinition } from "apollo-utilities"; // Something to do With Splitting Links

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

// Split the links so your query and mutations go to one link while subscriptions go to another
const LINK = split(
    // split based on operation type
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
        onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors)
                graphQLErrors.map(({ message, locations, path }) =>
                    console.log(
                        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                    )
                );
            if (networkError) console.log(`[Network error]: ${networkError}`);
        }),
        LINK
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
