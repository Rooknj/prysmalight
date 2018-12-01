const config = require("./config");

describe("serverSettings", () => {
  test("has a port defined", () => {
    expect(config.serverSettings.port).toBeDefined();
  });
});

describe("redisSettings", () => {
  test("has a port defined", () => {
    expect(config.redisSettings.port).toBeDefined();
  });

  test("has a host defined", () => {
    expect(config.redisSettings.host).toBeDefined();
  });
});

describe("mqttSettings", () => {
  test("has a host defined", () => {
    expect(config.mqttSettings.host).toBeDefined();
  });
});
