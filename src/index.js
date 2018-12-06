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
    const { AmqpPubSub } = require("graphql-rabbitmq-subscriptions");
    const bunyan = require("bunyan");

    // Create the apollo pubsub depencency
    const logger = bunyan.createLogger({ name: "gqlPubSub" });
    const pubsub = new AmqpPubSub({
      config: config.rabbitSettings,
      logger
    });

    // Generate the service
    ({ error, service } = await serviceFactory.connect({
      amqp,
      amqpSettings: config.rabbitSettings,
      gqlPubSub: pubsub
    }));

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
