const server = require("./server/server");
const MockLight = require("./mock/MockLight");
const Debug = require("debug").default;
const config = require("./config/config");
const repository = require("./repository/repository");
const messanger = require("./messanger/messanger");
const debug = Debug("main");

debug("--- Light Service ---");

process.on("uncaughtException", err => {
  debug("Unhandled Exception", err);
});

process.on("uncaughtRejection", err => {
  debug("Unhandled Rejection", err);
});

// TODO: Learn more about dependency injection adn fix this code to look more like the microservices example
const MQTT = require("async-mqtt");
const redis = require("redis");
const startServer = async () => {
  const pubsub = MQTT.connect(
    config.mqttSettings.host,
    {
      reconnectPeriod: config.mqttSettings.reconnectPeriod, // Amount of time between reconnection attempts
      username: config.mqttSettings.username,
      password: config.mqttSettings.password
    }
  );
  const db = redis.createClient(
    config.redisSettings.port,
    config.redisSettings.host
  );

  const repo = await repository.connect(db);
  const msgr = await messanger.connect(pubsub);

  // Start the server
  debug("Starting Server");
  server
    .start({
      port: config.serverSettings.port,
      repo,
      msgr
    })
    .then(app => {
      app.on("close", () => {
        debug("App Closed");
      });
    });

  // Start a Default Mock Light
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
};

startServer();
