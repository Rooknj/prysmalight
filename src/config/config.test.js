const config = require("./config");

describe("serverSettings", () => {
  test("has a default port of 4001", () => {
    expect(config.serverSettings.port).toBe(4001);
  });
});

describe("redisSettings", () => {
  test("has a default port of 6379", () => {
    expect(config.redisSettings.port).toBe(6379);
  });

  test("has a default host of localhost", () => {
    expect(config.redisSettings.host).toBe("localhost");
  });
});
//tcp://raspberrypi.local:1883
describe("mqttSettings", () => {
  test("has a default host of tcp://raspberrypi.local:1883", () => {
    expect(config.mqttSettings.host).toBe("tcp://raspberrypi.local:1883");
  });
});
