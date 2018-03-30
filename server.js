import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './data/schema';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';


const GRAPHQL_PORT = 4001;

const graphQLServer = express();

graphQLServer.use('*', cors({ origin: `http://localhost:${GRAPHQL_PORT}` }));
graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
graphQLServer.use('/graphiql', graphiqlExpress({ 
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}/subscriptions`
}));

const ws = createServer(graphQLServer);

ws.listen(GRAPHQL_PORT, () => {
  console.log(`GraphiQL is now running on http://localhost:${GRAPHQL_PORT}/graphiql`);
  console.log(`GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`);
  new SubscriptionServer({
    execute,
    subscribe,
    schema
  }, {
    server: ws,
    path: '/subscriptions',
  });
  console.log(`GraphQL Subscription Server is now running on http://localhost:${GRAPHQL_PORT}/subscriptions`);
});
