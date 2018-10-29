//const {EventEmitter} = require('events')
const server = require("./server/server");
const MockLight = require("./components/Mocks/MockLight");
const Debug = require("debug").default;
const debug = Debug("main");
//const repository = require('./repository/repository')
const config = require("./config/config");
//const mediator = new EventEmitter()

debug("--- Light Service ---");

process.on("uncaughtException", err => {
  debug("Unhandled Exception", err);
});

process.on("uncaughtRejection", err => {
  debug("Unhandled Rejection", err);
});

// Start the server
debug("Starting Server");
server
  .start({
    port: config.serverSettings.port
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

//mediator.emit('boot.ready')
