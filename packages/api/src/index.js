const config = require("./config/config");
const server = require("./server/server");
const Debug = require("debug").default;
const debug = Debug("main");
const serviceFactory = require("./service/service");

// Verbose statement of service starting
debug("--- API Gateway Microservice ---");

// Unhandled error logging
process.on("uncaughtException", err => {
  debug("Unhandled Exception", err);
});
process.on("uncaughtRejection", err => {
  debug("Unhandled Rejection", err);
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
      debug(error);
      process.exit(1);
    }
  }

  // Start the server
  debug("Starting Server");
  const app = await server.start({
    port: config.serverSettings.port,
    service
  });
  app.on("close", () => {
    debug("App Closed");
  });
};

startServer();
