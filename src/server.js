import express from "express"; // NodeJS Web Server
import cors from "cors"; // Cross Origin Resource Sharing Middleware
import helmet from "helmet"; // Security Middleware
import compression from "compression"; // Compression Middleware
import { graphqlExpress, graphiqlExpress } from "apollo-server-express"; // Hook up graphQL to express middleware
import { createServer } from "http"; // Library to create an http server
import bodyParser from "body-parser"; // Parses HTTP requests
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import ChalkConsole from "./ChalkConsole";
import schema from "./components/lights/lightsSchema";

const GRAPHQL_PORT = 4001;

const graphQLServer = express();

graphQLServer.use("*", cors());
graphQLServer.use(helmet());
graphQLServer.use(compression());
graphQLServer.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));
graphQLServer.use(
  "/graphiql",
  graphiqlExpress({
    endpointURL: "/graphql",
    subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}/subscriptions`
  })
);

// Create the Web Server from our express object and listen on the correct port
const webServer = createServer(graphQLServer);
webServer.listen(GRAPHQL_PORT, () => {
  // Start the GraphQL Subscriptions server
  new SubscriptionServer(
    { execute, subscribe, schema },
    { server: webServer, path: "/subscriptions" }
  );

  ChalkConsole.info(
    `GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`
  );
  ChalkConsole.info(
    `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
  );
  ChalkConsole.info(
    `GraphQL Subscription Server is now running on ws://localhost:${GRAPHQL_PORT}/subscriptions`
  );
});
