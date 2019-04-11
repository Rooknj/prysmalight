"use strict";
// Enable console log statements in this file
/*eslint no-console:0*/

const config = require("./config");
const Server = require("./server/server");
const MockLight = require("./mock/MockLight");
const packageJson = require("../package.json");

const { version } = packageJson;

// Verbose statement of service starting
console.log(`--- Prysmalight ${version} ---`);

// Unhandled error logging
process.on("uncaughtException", err => {
  console.log("Unhandled Exception", err);
});
process.on("uncaughtRejection", err => {
  console.log("Unhandled Rejection", err);
});

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

// Start the server
console.log("Starting Server");
const server = new Server();
server.start(config.serverSettings.port).then(() => {
  console.log(
    `🚀 Server ready at http://localhost:${config.serverSettings.port}${
      server.graphqlPath
    }`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${config.serverSettings.port}${
      server.subscriptionsPath
    }`
  );
});
