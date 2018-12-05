const config = require("./config");

describe("serverSettings", () => {
  test("has a port defined", () => {
    expect(config.serverSettings.port).toBeDefined();
  });
});

describe("rabbitSettings", () => {
  test("has a host defined", () => {
    expect(config.rabbitSettings.host).toBeDefined();
  });
});
