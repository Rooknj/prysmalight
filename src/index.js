"use strict";
const config = require("./config/config");
const server = require("./server/server");
const serviceFactory = require("./service/service");
const dbFactory = require("./repository/dbFactory");
const pubsubFactory = require("./repository/pubsubFactory");
const repository = require("./repository/repository");
const MockLight = require("./mock/MockLight");

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

// Initialize the global event emitter
// TODO: Figure out where to put this
const events = require("events");
const event = new events.EventEmitter();

// Get and initialize the repo
const getRepo = () => {
  if (process.env.MOCK) return require("./mock/mockRepository");

  // Create all dependencies
  const redis = require("redis");
  const dbClient = redis.createClient(
    config.redisSettings.port,
    config.redisSettings.host
  );
  // TODO: add the MQTT Topics as a part of dependency injection
  const mqtt = require("async-mqtt");
  const pubsubClient = mqtt.connect(config.mqttSettings.host, {
    reconnectPeriod: config.mqttSettings.reconnectPeriod, // Amount of time between reconnection attempts
    username: config.mqttSettings.username,
    password: config.mqttSettings.password
  });

  // Create our db and pubsub with the provided clients
  const db = dbFactory(dbClient);
  const pubsub = pubsubFactory(pubsubClient);

  // Inject Dependencies
  return repository({ db, pubsub, event });
};
const repo = getRepo();
repo.init();

// Create a Default Mock Light
const createMockLight = async mockName => {
  console.log(`Starting mock light: ${mockName}`);
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
  console.log(`${mockName} Ready`);
};
createMockLight("Default Mock");

// Set up any extra mock lights if the environment dictates it
if (process.env.MOCKS) {
  const mockArray = process.env.MOCKS.split(",");
  mockArray.forEach(createMockLight);
}

// Start the GraphQL server
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
