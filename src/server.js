import express from "express"; // NodeJS Web Server
import cors from "cors"; // Cross Origin Resource Sharing Middleware
import helmet from "helmet"; // Security Middleware
import compression from "compression"; // Compression Middleware
import { graphqlExpress, graphiqlExpress } from "apollo-server-express"; // Hook up graphQL to express middleware
import { createServer } from "http"; // Library to create an http server
import bodyParser from "body-parser"; // Parses HTTP requests
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import schema from "./components/schema";
import Debug from "debug";

const debug = Debug("server");

const GRAPHQL_PORT = 4001;

const app = express();

app.use("*", cors());
app.use(helmet());
app.use(compression());
app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));
app.use(
  "/graphiql",
  graphiqlExpress({
    endpointURL: "/graphql",
    subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}/subscriptions`
  })
);

// Create the Web Server from our express object and listen on the correct port
const graphQLServer = createServer(app);
graphQLServer.listen(GRAPHQL_PORT, () => {
  // Start the GraphQL Subscriptions server
  new SubscriptionServer(
    { execute, subscribe, schema },
    { server: graphQLServer, path: "/subscriptions" }
  );

  debug(`GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`);
  debug(`GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`);
  debug(
    `GraphQL Subscription Server is now running on ws://localhost:${GRAPHQL_PORT}/subscriptions`
  );
});
