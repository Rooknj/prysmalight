const pubsubFactory = require("./pubsubFactory");
const { isObservable } = require("rxjs");
const { mqttSettings } = require("../config/config");

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = mqttSettings.MQTT_LIGHT_TOP_LEVEL;
const MQTT_LIGHT_CONNECTED_TOPIC = mqttSettings.MQTT_LIGHT_CONNECTED_TOPIC;
const MQTT_LIGHT_STATE_TOPIC = mqttSettings.MQTT_LIGHT_STATE_TOPIC;
const MQTT_LIGHT_COMMAND_TOPIC = mqttSettings.MQTT_LIGHT_COMMAND_TOPIC;
const MQTT_EFFECT_LIST_TOPIC = mqttSettings.MQTT_EFFECT_LIST_TOPIC;

// Creates a mock client which will return successful responses but no data
const createMockClient = () => {
  return {
    on: () => {},
    connected: true
  };
};

describe("connections", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(pubsub.connections).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(isObservable(pubsub.connections)).toBe(true);
  });
});

describe("disconnections", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(pubsub.disconnections).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(isObservable(pubsub.disconnections)).toBe(true);
  });
});

describe("allMessages", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(pubsub.allMessages).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(isObservable(pubsub.allMessages)).toBe(true);
  });

  test("correctly returns messages from all topics", () => {});
});

describe("connectMessages", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(pubsub.connectMessages).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(isObservable(pubsub.connectMessages)).toBe(true);
  });

  test("only returns messages from the connect topic", () => {});
});

describe("stateMessages", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(pubsub.stateMessages).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(isObservable(pubsub.stateMessages)).toBe(true);
  });

  test("only returns messages from the state topic", () => {});
});

describe("effectMessages", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(pubsub.effectMessages).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory(mockClient);
    expect(isObservable(pubsub.effectMessages)).toBe(true);
  });

  test("only returns messages from the effect list topic", () => {});
});

describe("subscribeToLight", () => {
  test("returns an error if the client is not connected", () => {});
});

describe("publishToLight", () => {
  test("returns an error if the client is not connected", () => {});
});

describe("unsubscribeFromLight", () => {
  test("returns an error if the client is not connected", () => {});
});
