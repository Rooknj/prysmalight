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
