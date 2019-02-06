const config = require("./config");

describe("serverSettings", () => {
  test("has a port defined", () => {
    expect(config.serverSettings.port).toBeDefined();
  });
});

describe("rabbitSettings", () => {
  test("has a hostname defined", () => {
    expect(config.rabbitSettings.hostname).toBeDefined();
  });

  test("has a port defined", () => {
    expect(config.rabbitSettings.port).toBeDefined();
  });

  test("has a protocol defined", () => {
    expect(config.rabbitSettings.protocol).toBeDefined();
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
