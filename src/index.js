const config = require("./config/config");
const server = require("./server/server");
const dbFactory = require("./repository/dbFactory");
const pubsubFactory = require("./repository/pubsubFactory");
const repository = require("./repository/repository");
const MockLight = require("./mock/MockLight");
const Debug = require("debug").default;
const debug = Debug("main");

// Verbose statement of service starting
debug("--- Light Service ---");

// Unhandled error logging
process.on("uncaughtException", err => {
  debug("Unhandled Exception", err);
});
process.on("uncaughtRejection", err => {
  debug("Unhandled Rejection", err);
});

const getRepo = () => {
  const mockRepository = require("./mock/mockRepository");
  if (process.env.MOCK) return mockRepository;

  // Create all dependencies
  const redis = require("redis");
  const dbClient = redis.createClient(
    config.redisSettings.port,
    config.redisSettings.host
  );
  // TODO: add the MQTT Topics as a part of dependency injection
  const mqtt = require("async-mqtt");
  const pubsubClient = mqtt.connect(
    config.mqttSettings.host,
    {
      reconnectPeriod: config.mqttSettings.reconnectPeriod, // Amount of time between reconnection attempts
      username: config.mqttSettings.username,
      password: config.mqttSettings.password
    }
  );

  //TODO: Include this stuff in deps
  const { PubSub } = require("apollo-server");
  const gqlPubSub = new PubSub();

  // TODO: Figure out where to put this
  const events = require("events");
  const event = new events.EventEmitter();

  // Create our db and pubsub with the provided clients
  const db = dbFactory(dbClient);
  const pubsub = pubsubFactory(pubsubClient);

  // Inject Dependencies
  return repository({ db, pubsub, gqlPubSub, event });
};

// Start the server
const repo = getRepo();
repo.init();
debug("Starting Server");
server
  .start({
    port: config.serverSettings.port,
    repo
  })
  .then(app => {
    app.on("close", () => {
      debug("App Closed");
    });
  });

// Create a Default Mock Light
const createMockLight = mockName => {
  debug(`Starting mock light: ${mockName}`);
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
  debug(`${mockName} Ready`);
};
createMockLight("Default Mock");

// Set up any extra mock lights if the environment dictates it
if (process.env.MOCKS) {
  const mockArray = process.env.MOCKS.split(",");
  mockArray.forEach(createMockLight);
}
