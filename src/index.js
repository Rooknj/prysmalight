"use strict";
// Enable console log statements in this file
/*eslint no-console:0*/

const config = require("./config/config");
const server = require("./server/server");
const serverServiceFactory = require("./server/serverService");
const repository = require("./repository/repository");
const MockLight = require("./mock/MockLight");
const mediatorFactory = require("./mediator/mediator");
const redis = require("redis");
const mqtt = require("async-mqtt");
const { PubSub } = require("graphql-subscriptions");
const dbFactory = require("./repository/dbFactory");
const pubsubFactory = require("./repository/pubsubFactory");
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
    const redisClient = redis.createClient(
      config.redisSettings.port,
      config.redisSettings.host
    );

    // Create an MQTT client
    const mqttClient = mqtt.connect(config.mqttSettings.host, {
      reconnectPeriod: config.mqttSettings.reconnectPeriod, // Amount of time between reconnection attempts
      username: config.mqttSettings.username,
      password: config.mqttSettings.password
    });

    const db = dbFactory(redisClient);
    const pubsub = pubsubFactory(mqttClient);
    const mediator = mediatorFactory(eventEmitter, redisClient);

    // Create a gqlPubSub
    const gqlPubSub = new PubSub();

    // Start the Repository
    const repo = repository({ mediator, db, pubsub });
    repo.init();

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
