const config = require("./config/config");
const server = require("./server/server");
const Debug = require("debug").default;
const debug = Debug("main");
const repository = require("./repository/repository");

// Verbose statement of service starting
debug("--- API Gateway Microservice ---");

// Unhandled error logging
process.on("uncaughtException", err => {
  debug("Unhandled Exception", err);
});
process.on("uncaughtRejection", err => {
  debug("Unhandled Rejection", err);
});

const amqp = require("amqplib");
const { PubSub } = require("apollo-server");

const startServer = async () => {
  // Connect to the repository
  let repo = null,
    error = null;
  if (process.env.MOCK) {
    const mockRepository = require("./mock/mockRepository");
    repo = mockRepository;
  } else {
    const pubSubClient = new PubSub();
    ({ error, repo } = await repository({
      amqp,
      amqpSettings: config.rabbitSettings,
      gqlPubSub: pubSubClient
    }));
    if (error) {
      debug(error);
      process.exit(1);
    }
  }

  // Start the server
  debug("Starting Server");
  const app = await server.start({
    port: config.serverSettings.port,
    repo
  });

  app.on("close", () => {
    debug("App Closed");
  });
};

startServer();
