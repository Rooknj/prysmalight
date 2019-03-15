"use strict";
// Enable console log statements in this file
/*eslint no-console:0*/

const config = require("./config");
const createServer = require("./server/server");
const serverServiceFactory = require("./server/serverService");
const createLightService = require("./lightService");
const MockLight = require("./mock/MockLight");
const mediatorFactory = require("./mediator/mediator");
const { PubSub } = require("graphql-subscriptions");
const dbFactory = require("./lightService/dbFactory");
const pubsubFactory = require("./lightService/pubsubFactory");
const events = require("events");

// Verbose statement of service starting
console.log("--- Prysmalight ---");

// Unhandled error logging
process.on("uncaughtException", err => {
  console.log("Unhandled Exception", err);
});
process.on("uncaughtRejection", err => {
  console.log("Unhandled Rejection", err);
});

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
    // Initialize the global event emitter
    const eventEmitter = new events.EventEmitter();

    // Create a redis client
    const redisClient = config.redis.connect(config.redisSettings);

    // Create an MQTT client
    const mqttClient = config.mqtt.connect(config.mqttSettings);

    const mediator = mediatorFactory(eventEmitter, redisClient);
    const db = dbFactory(redisClient);
    const pubsub = pubsubFactory({ client: mqttClient, mediator });

    // Create a gqlPubSub
    const gqlPubSub = new PubSub();

    // Start the lightService
    const lightService = createLightService({ mediator, db, pubsub });
    lightService.init();

    // Start the Default Mock Light
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
    if (process.env.MOCKS) {
      // Set up any extra mock lights if the environment dictates it
      const mockArray = process.env.MOCKS.split(",");
      mockArray.forEach(createMockLight);
    }

    service = serverServiceFactory(mediator, gqlPubSub);
  }

  // Start the server
  console.log("Starting Server");
  const server = createServer({
    lightService: service
  });
  const { app, port, gqlPath, subscriptionsPath } = await server.start(
    config.serverSettings.port
  );
  console.log(`🚀 Server ready at http://localhost:${port}${gqlPath}`);
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${port}${subscriptionsPath}`
  );
  app.on("close", () => {
    console.log("App Closed");
  });
};
startServer();
