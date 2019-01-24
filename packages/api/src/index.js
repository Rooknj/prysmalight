const config = require("./config/config");
const server = require("./server/server");
const serviceFactory = require("./service/service");

// Enable console log statements in this file
/*eslint no-console:0*/

// Verbose statement of service starting
console.log("--- API Gateway Microservice ---");

// Unhandled error logging
process.on("uncaughtException", err => {
  console.log("Unhandled Exception", err);
});
process.on("uncaughtRejection", err => {
  console.log("Unhandled Rejection", err);
});

const startServer = async () => {
  let service = null,
    error = null;

  // Get a service
  if (process.env.MOCK) {
    // Use the mock service if the MOCK env variable is set
    const mockService = require("./mock/mockService");
    service = mockService;
  } else {
    // Create the real service
    const amqp = require("amqplib");

    // Create the gqlPubSub
    // Note: the graphql-rabbitmq-subscriptions library creates channels which it never destroys every time you use a function
    // like pubsub.asyncIterator() or pubsub.publish(). This is why I stopped using it as rabbitmq would eventually run out of
    // memory and crash.
    const { PubSub } = require("graphql-subscriptions");
    const pubsub = new PubSub();

    // Generate the service
    ({ error, service } = await serviceFactory.connect({
      amqp,
      amqpSettings: config.rabbitSettings,
      gqlPubSub: pubsub
    }));

    // Init the service
    await service.init();

    // If there was an error creating the service, log the error and exit
    if (error) {
      console.log(error);
      process.exit(1);
    }
  }

  // Start the server
  console.log("Starting Server");
  const { app, port, gqlPath, subscriptionsPath } = await server.start({
    port: config.serverSettings.port,
    service
  });
  console.log(`🚀 Server ready at http://localhost:${port}${gqlPath}`);
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${port}${subscriptionsPath}`
  );
  app.on("close", () => {
    console.log("App Closed");
  });
};

startServer();
