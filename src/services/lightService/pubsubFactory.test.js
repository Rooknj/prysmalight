const pubsubFactory = require("./pubsubFactory");
const { isObservable } = require("rxjs");
const { mqttSettings } = require("../../config");

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = mqttSettings.MQTT_LIGHT_TOP_LEVEL;
const MQTT_LIGHT_CONNECTED_TOPIC = mqttSettings.MQTT_LIGHT_CONNECTED_TOPIC;
const MQTT_LIGHT_STATE_TOPIC = mqttSettings.MQTT_LIGHT_STATE_TOPIC;
const MQTT_LIGHT_COMMAND_TOPIC = mqttSettings.MQTT_LIGHT_COMMAND_TOPIC;
const MQTT_EFFECT_LIST_TOPIC = mqttSettings.MQTT_EFFECT_LIST_TOPIC;
const MQTT_LIGHT_CONFIG_TOPIC = mqttSettings.MQTT_LIGHT_CONFIG_TOPIC;

// Creates a mock client which will return successful responses but no data
const createMockClient = () => {
  return {
    on: () => {},
    subscribe: jest.fn(async topic => [{ topic, qos: 0 }]),
    publish: jest.fn(async (topic, payload) => {}),
    unsubscribe: jest.fn(async topic => {})
  };
};

const createMockMediator = () => {
  return {
    subscribe: jest.fn(async topic => [{ topic, qos: 0 }]),
    publish: jest.fn(async (topic, payload) => {}),
    unsubscribe: jest.fn(async topic => {})
  };
};

describe("connections", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(pubsub.connections).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(isObservable(pubsub.connections)).toBe(true);
  });
});

describe("disconnections", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(pubsub.disconnections).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(isObservable(pubsub.disconnections)).toBe(true);
  });
});

describe("allMessages", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(pubsub.allMessages).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(isObservable(pubsub.allMessages)).toBe(true);
  });

  test("correctly returns messages from all topics", () => {});
});

describe("connectMessages", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(pubsub.connectMessages).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(isObservable(pubsub.connectMessages)).toBe(true);
  });

  test("only returns messages from the connect topic", () => {});
});

describe("stateMessages", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(pubsub.stateMessages).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(isObservable(pubsub.stateMessages)).toBe(true);
  });

  test("only returns messages from the state topic", () => {});
});

describe("effectMessages", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(pubsub.effectMessages).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    expect(isObservable(pubsub.effectMessages)).toBe(true);
  });

  test("only returns messages from the effect list topic", () => {});
});

describe("subscribeToLight", () => {
  test("Subscribes to all the correct topics (Example 1)", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test A";

    // Call The Method
    const error = await pubsub.subscribeToLight(ID);

    // Test
    expect(error).toBeNull();
    expect(mockClient.subscribe).toBeCalledTimes(4);
    expect(mockClient.subscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_STATE_TOPIC}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_EFFECT_LIST_TOPIC}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_CONFIG_TOPIC}`
    );
  });
  test("Subscribes to all the correct topics (Example 2)", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test 123";

    // Call The Method
    const error = await pubsub.subscribeToLight(ID);

    // Test
    expect(error).toBeNull();
    expect(mockClient.subscribe).toBeCalledTimes(4);
    expect(mockClient.subscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_STATE_TOPIC}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_EFFECT_LIST_TOPIC}`
    );
    expect(mockClient.subscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_CONFIG_TOPIC}`
    );
  });
  test("returns an error if the client is not connected", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = false;
    const ID = "Test A";

    // Call The Method
    const error = await pubsub.subscribeToLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to subscribe to at least one topic", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    mockClient.subscribe = jest.fn(async () => {
      throw new Error();
    });
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test A";

    // Call The Method
    const error = await pubsub.subscribeToLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
    expect(mockClient.subscribe).toBeCalled();
  });
  test("returns an error if no id was provided", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;

    // Call The Method
    const error = await pubsub.subscribeToLight();

    // Test
    expect(error).toBeInstanceOf(Error);
  });
});

describe("publishToLight", () => {
  test("Publishes the message to the correct topic as a buffer (Example 1)", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test A";
    const MESSAGE = { brightness: 40 };

    // Call The Method
    const error = await pubsub.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeNull();
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_COMMAND_TOPIC}`,
      Buffer.from(JSON.stringify(MESSAGE))
    );
  });
  test("Publishes the message to the correct topic as a buffer (Example 2)", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test A";
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await pubsub.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeNull();
    expect(mockClient.publish).toBeCalledTimes(1);
    expect(mockClient.publish).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_COMMAND_TOPIC}`,
      Buffer.from(JSON.stringify(MESSAGE))
    );
  });
  test("returns an error if the client is not connected", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = false;
    const ID = "Test A";
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await pubsub.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if the client fails to publish", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    mockClient.publish = jest.fn(() => {
      throw new Error();
    });
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test A";
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await pubsub.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
    expect(mockClient.publish).toBeCalled();
  });
  test("returns an error if no id was provided", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = null;
    const MESSAGE = { effect: "Cylon" };

    // Call The Method
    const error = await pubsub.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if no message was provided", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test A";
    const MESSAGE = null;

    // Call The Method
    const error = await pubsub.publishToLight(ID, MESSAGE);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
});

describe("unsubscribeFromLight", () => {
  test("Unsubscribes from all the correct topics (Example 1)", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test A";

    // Call The Method
    const error = await pubsub.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeNull();
    expect(mockClient.unsubscribe).toBeCalledTimes(4);
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_STATE_TOPIC}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_EFFECT_LIST_TOPIC}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_CONFIG_TOPIC}`
    );
  });
  test("Unsubscribes from all the correct topics (Example 2)", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test 123";

    // Call The Method
    const error = await pubsub.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeNull();
    expect(mockClient.unsubscribe).toBeCalledTimes(4);
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_STATE_TOPIC}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_EFFECT_LIST_TOPIC}`
    );
    expect(mockClient.unsubscribe).toBeCalledWith(
      `${MQTT_LIGHT_TOP_LEVEL}/${ID}/${MQTT_LIGHT_CONFIG_TOPIC}`
    );
  });
  test("returns an error if the client is not connected", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = false;
    const ID = "Test A";

    // Call The Method
    const error = await pubsub.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to unsubscribe from at least one topic", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    mockClient.unsubscribe = jest.fn(async () => {
      throw new Error();
    });
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;
    const ID = "Test A";

    // Call The Method
    const error = await pubsub.unsubscribeFromLight(ID);

    // Test
    expect(error).toBeInstanceOf(Error);
    expect(mockClient.unsubscribe).toBeCalled();
  });
  test("returns an error if no id was provided", async () => {
    // Create the client and pubsub
    let mockClient = createMockClient();
    const pubsub = pubsubFactory({
      client: mockClient,
      mediator: createMockMediator()
    });
    pubsub.__proto__.connected = true;

    // Call The Method
    const error = await pubsub.unsubscribeFromLight();

    // Test
    expect(error).toBeInstanceOf(Error);
  });
});
