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
import MockLight from "./components/LightService/Mocks/MockLight";
import Debug from "debug";

const debug = Debug("server");
console.log("TODO: Upgrade to Apollo Server 2.0");
console.log("TODO: Upgrade to use ReactiveX JS");

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
