"use strict";
const config = require("./config/config");
const server = require("./server/server");
const serverServiceFactory = require("./server/serverService");
const repository = require("./repository/repository");
const MockLight = require("./mock/MockLight");
const mediatorFactory = require("./mediator/mediator");
const redis = require("redis");
const mqtt = require("async-mqtt");
const mockRepo = require("./mock/mockRepository");
const dbFactory = require("./dbFactory");
const pubsubFactory = require("./pubsubFactory");

// Enable console log statements in this file
/*eslint no-console:0*/

// Verbose statement of service starting
console.log("--- Prysmalight ---");

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
const mediator = mediatorFactory(event);

// Create the gqlPubSub
const { PubSub } = require("graphql-subscriptions");
const gqlPubSub = new PubSub();

// Start the Repository
let repo;
if (process.env.MOCK) {
  repo = mockRepo;
} else {
  const dbClient = redis.createClient(
    config.redisSettings.port,
    config.redisSettings.host
  );

  const pubsubClient = mqtt.connect(config.mqttSettings.host, {
    reconnectPeriod: config.mqttSettings.reconnectPeriod, // Amount of time between reconnection attempts
    username: config.mqttSettings.username,
    password: config.mqttSettings.password
  });

  const db = dbFactory(dbClient);
  const pubsub = pubsubFactory(pubsubClient);
  // Inject Dependencies
  repo = repository({ mediator, db, pubsub });
  repo.init();
}

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
  let service = null;

  // Get a service
  if (process.env.MOCK) {
    // Use the mock service if the MOCK env variable is set
    const mockService = require("./mock/mockService");
    service = mockService;
  } else {
    // Create the real service
    service = serverServiceFactory(mediator, gqlPubSub);
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
