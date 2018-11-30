const repository = require("./repository");
const rxjs = require("rxjs");
const events = require("events");

const createMockLight = id => ({
  id: id || "Test A",
  connected: true,
  state: "ON",
  brightness: 72,
  color: { r: 0, g: 127, b: 255 },
  effect: "None",
  speed: 3,
  supportedEffects: ["Effect 1", "Effect 2", "Effect 3"]
});

// Creates a mock db
const createMockDependencies = () => {
  let mockDB = {
    connected: true,
    connections: { subscribe: jest.fn() },
    disconnections: { subscribe: jest.fn() },
    getAllLights: jest.fn(async () => ({
      error: null,
      lights: [createMockLight("Test A"), createMockLight("Test B")]
    })),
    getLight: jest.fn(async id => ({
      error: null,
      light: createMockLight(id)
    })),
    setLight: jest.fn(async () => null),
    addLight: jest.fn(async () => null),
    removeLight: jest.fn(async () => null),
    hasLight: jest.fn(async () => ({ error: null, hasLight: true }))
  };
  let mockPubsub = {
    connected: true,
    connections: { subscribe: jest.fn() },
    disconnections: { subscribe: jest.fn() },
    allMessages: { subscribe: jest.fn() },
    connectMessages: { subscribe: jest.fn() },
    stateMessages: { subscribe: jest.fn() },
    effectMessages: { subscribe: jest.fn() },
    subscribeToLight: jest.fn(async id => null),
    unsubscribeFromLight: jest.fn(async id => null),
    publishToLight: jest.fn(async (id, topic) => null)
  };
  let mockGqlPubSub = {
    publish: jest.fn(),
    asyncIterator: jest.fn()
  };
  return { db: mockDB, pubsub: mockPubsub, gqlPubSub: mockGqlPubSub };
};

describe("repository & init", () => {
  test("Subscribes once to all relavent observables upon creation", () => {
    let mockDeps = createMockDependencies();

    let repo = repository(mockDeps);
    repo.init();

    expect(mockDeps.db.connections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.db.disconnections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.connections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.disconnections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.connectMessages.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.stateMessages.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.effectMessages.subscribe).toBeCalledTimes(1);
  });
  test("attempts to connect when the db connects", () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.connected = false;
    mockDeps.pubsub.connected = false;
    const eventEmitter = new events.EventEmitter();
    mockDeps.db.connections = rxjs.fromEvent(eventEmitter, "dbConnect");

    let repo = repository(mockDeps);
    repo.__proto__.connect = jest.fn();
    repo.init();

    eventEmitter.emit("dbConnect");

    expect(repo.connect).toBeCalledTimes(1);
  });
  test("attempts to connect when the pubsub connects", () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.connected = false;
    mockDeps.pubsub.connected = false;
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.connections = rxjs.fromEvent(eventEmitter, "pubsubConnect");

    let repo = repository(mockDeps);
    repo.__proto__.connect = jest.fn();
    repo.init();

    eventEmitter.emit("pubsubConnect");

    expect(repo.connect).toBeCalledTimes(1);
  });
  test("sets connected property to false if the db disconnects", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.disconnections = rxjs.fromEvent(
      eventEmitter,
      "pubsubDisonnect"
    );

    let repo = repository(mockDeps);
    repo.init();

    eventEmitter.emit("pubsubDisonnect");

    expect(repo.connected).toBe(false);
  });
  test("sets connected property to false if the pubsub disconnects", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.db.disconnections = rxjs.fromEvent(eventEmitter, "dbDisonnect");

    let repo = repository(mockDeps);
    repo.init();

    eventEmitter.emit("dbDisonnect");

    expect(repo.connected).toBe(false);
  });
  test("handles connected messages when received", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.connectMessages = rxjs.fromEvent(
      eventEmitter,
      "connectMessage"
    );

    let repo = repository(mockDeps);
    repo.__proto__.handleConnectMessage = jest.fn();
    repo.init();

    const MESSAGE = "message";
    eventEmitter.emit("connectMessage", MESSAGE);

    expect(repo.handleConnectMessage).toBeCalledTimes(1);
    expect(repo.handleConnectMessage).toBeCalledWith(MESSAGE);
  });
  test("handles state messages when received", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.stateMessages = rxjs.fromEvent(
      eventEmitter,
      "connectMessage"
    );

    let repo = repository(mockDeps);
    repo.__proto__.handleStateMessage = jest.fn();
    repo.init();

    const MESSAGE = "message";
    eventEmitter.emit("connectMessage", MESSAGE);

    expect(repo.handleStateMessage).toBeCalledTimes(1);
    expect(repo.handleStateMessage).toBeCalledWith(MESSAGE);
  });
  test("handles effect list messages when received", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.effectMessages = rxjs.fromEvent(
      eventEmitter,
      "effectListMessage"
    );

    let repo = repository(mockDeps);
    repo.__proto__.handleEffectListMessage = jest.fn();
    repo.init();

    const MESSAGE = "message";
    eventEmitter.emit("effectListMessage", MESSAGE);

    expect(repo.handleEffectListMessage).toBeCalledTimes(1);
    expect(repo.handleEffectListMessage).toBeCalledWith(MESSAGE);
  });
});

describe("connect", () => {
  test("subscribes to all added lights then sets connected to true (Example 1)", async () => {
    let mockDeps = createMockDependencies();
    const MOCKLIGHTS = [
      createMockLight("Test A"),
      createMockLight("Test 2"),
      createMockLight("QUERTY123")
    ];
    mockDeps.db.getAllLights = jest.fn(async () => ({
      error: null,
      lights: MOCKLIGHTS
    }));
    const repo = repository(mockDeps);

    const error = await repo.connect();

    expect(error).toBeNull();
    expect(mockDeps.db.getAllLights).toBeCalled();
    expect(mockDeps.pubsub.subscribeToLight).toBeCalledTimes(MOCKLIGHTS.length);
    MOCKLIGHTS.forEach(light => {
      expect(mockDeps.pubsub.subscribeToLight).toBeCalledWith(light.id);
    });
    expect(repo.connected).toBe(true);
  });
  test("subscribes to all added lights then sets connected to true (Example 2)", async () => {
    let mockDeps = createMockDependencies();
    const MOCKLIGHTS = [createMockLight("Test B"), createMockLight("999")];
    mockDeps.db.getAllLights = jest.fn(async () => ({
      error: null,
      lights: MOCKLIGHTS
    }));
    const repo = repository(mockDeps);

    const error = await repo.connect();

    expect(error).toBeNull();
    expect(mockDeps.db.getAllLights).toBeCalled();
    expect(mockDeps.pubsub.subscribeToLight).toBeCalledTimes(MOCKLIGHTS.length);
    MOCKLIGHTS.forEach(light => {
      expect(mockDeps.pubsub.subscribeToLight).toBeCalledWith(light.id);
    });
    expect(repo.connected).toBe(true);
  });
  test("returns an error if the db is not connected", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.connected = false;
    const repo = repository(mockDeps);

    const error = await repo.connect();

    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if the pubsub is not connected", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.pubsub.connected = false;
    const repo = repository(mockDeps);

    const error = await repo.connect();

    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error and does not set connected to true if an error occurs while getting all lights", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.getAllLights = jest.fn(async () => ({
      error: new Error()
    }));
    const repo = repository(mockDeps);

    const error = await repo.connect();

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.getAllLights).toBeCalled();
    expect(repo.connected).toBe(false);
  });
  test("returns an error and does not set connected to true if an error occurs while subscribing", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.pubsub.subscribeToLight = jest.fn(async () => new Error());
    const repo = repository(mockDeps);

    const error = await repo.connect();

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.pubsub.subscribeToLight).toBeCalled();
    expect(repo.connected).toBe(false);
  });
});

describe.skip("handleConnectMessage", () => {
  test("Test", async () => {});
});

describe.skip("handleStateMessage", () => {
  test("Test", async () => {});
});

describe.skip("handleEffectListMessage", () => {
  test("Test", async () => {});
});

describe("getLight", () => {
  test("Gets the light with the specified id (Example 1)", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    const MOCKLIGHT = createMockLight(ID);
    mockDeps.db.getLight = jest.fn(async () => ({
      error: null,
      light: MOCKLIGHT
    }));
    const repo = repository(mockDeps);

    const response = await repo.getLight(ID);

    expect(response).toEqual(MOCKLIGHT);
    expect(mockDeps.db.getLight).toBeCalledWith(ID);
  });
  test("Gets the light with the specified id (Example 2)", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test QREWO";
    const MOCKLIGHT = createMockLight(ID);
    mockDeps.db.getLight = jest.fn(async () => ({
      error: null,
      light: MOCKLIGHT
    }));
    const repo = repository(mockDeps);

    const response = await repo.getLight(ID);

    expect(response).toEqual(MOCKLIGHT);
    expect(mockDeps.db.getLight).toBeCalledWith(ID);
  });
  test("Returns an error if the light isn't added", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test QREWO";
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: null,
      hasLight: false
    }));
    const repo = repository(mockDeps);

    const response = await repo.getLight(ID);

    expect(response).toBeInstanceOf(Error);
  });
  test("Returns an error if it fails to check if the light was added", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test QREWO";
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: new Error(),
      hasLight: null
    }));
    const repo = repository(mockDeps);

    const response = await repo.getLight(ID);

    expect(response).toBeInstanceOf(Error);
  });
  test("Returns an error if it fails to get the light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    mockDeps.db.getLight = jest.fn(async () => ({
      error: new Error(),
      light: null
    }));
    const repo = repository(mockDeps);

    const response = await repo.getLight(ID);

    expect(response).toBeInstanceOf(Error);
  });
});

describe("getLights", () => {
  test("Gets all the lights", async () => {
    let mockDeps = createMockDependencies();
    const MOCKLIGHTS = [createMockLight("Test A"), createMockLight("Test B")];
    mockDeps.db.getAllLights = jest.fn(async () => ({
      error: null,
      lights: MOCKLIGHTS
    }));
    const repo = repository(mockDeps);

    const response = await repo.getLights();

    expect(response).toEqual(MOCKLIGHTS);
    expect(mockDeps.db.getAllLights).toBeCalled();
  });
  test("returns an error if it fails to get all the lights", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.getAllLights = jest.fn(async () => ({
      error: new Error(),
      lights: null
    }));
    const repo = repository(mockDeps);

    const response = await repo.getLights();

    expect(response).toBeInstanceOf(Error);
    expect(mockDeps.db.getAllLights).toBeCalled();
  });
});

describe("addLight", () => {
  test("adds the light with no errors", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    const MOCKLIGHT = createMockLight(ID);
    mockDeps.db.addLight = jest.fn(async () => null);
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: null,
      hasLight: false
    }));
    const repo = repository(mockDeps);
    repo.__proto__.getLight = jest.fn(() => MOCKLIGHT);

    const response = await repo.addLight(ID);

    expect(response).toBe(MOCKLIGHT);
    expect(mockDeps.db.addLight).toBeCalledWith(ID);
    expect(mockDeps.pubsub.subscribeToLight).toBeCalledWith(ID);
  });
  test("notifies subscribers of the added light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    const MOCKLIGHT = createMockLight(ID);
    mockDeps.db.addLight = jest.fn(async () => null);
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: null,
      hasLight: false
    }));
    const repo = repository(mockDeps);
    repo.__proto__.getLight = jest.fn(() => MOCKLIGHT);

    await repo.addLight(ID);

    expect(mockDeps.gqlPubSub.publish).toBeCalledWith("lightAdded", {
      lightAdded: MOCKLIGHT
    });
  });
  test("returns an error if the light was already added", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    mockDeps.db.addLight = jest.fn(async () => null);
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: null,
      hasLight: true
    }));
    const repo = repository(mockDeps);
    repo.__proto__.getLight = jest.fn();

    const response = await repo.addLight(ID);

    expect(response).toBeInstanceOf(Error);
    expect(mockDeps.db.hasLight).toBeCalledWith(ID);
  });
  test("returns an error if it failed to check if the light was already added", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    mockDeps.db.addLight = jest.fn(async () => null);
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: new Error(),
      hasLight: null
    }));
    const repo = repository(mockDeps);
    repo.__proto__.getLight = jest.fn();

    const response = await repo.addLight(ID);

    expect(response).toBeInstanceOf(Error);
    expect(mockDeps.db.hasLight).toBeCalledWith(ID);
  });
  test("returns an error if it failed to add the light to the db", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    mockDeps.db.addLight = jest.fn(async () => new Error());
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: null,
      hasLight: false
    }));
    const repo = repository(mockDeps);
    repo.__proto__.getLight = jest.fn();

    const response = await repo.addLight(ID);

    expect(response).toBeInstanceOf(Error);
    expect(mockDeps.db.addLight).toBeCalledWith(ID);
  });
});

describe.skip("removeLight", () => {
  test("Test", async () => {});
});

describe.skip("setLight", () => {
  test("Test", async () => {});
});

describe("subscribeToLight", () => {
  test("subscribes to the specified light (Example 1)", () => {
    let mockDeps = createMockDependencies();
    const SUBSCRIPTION = "subscription";
    mockDeps.gqlPubSub.asyncIterator = jest.fn(() => SUBSCRIPTION);
    const repo = repository(mockDeps);

    const ID = "Test A";
    const subscription = repo.subscribeToLight(ID);

    expect(mockDeps.gqlPubSub.asyncIterator).toBeCalledWith(ID);
    expect(subscription).toBe(SUBSCRIPTION);
  });

  test("subscribes to the specified light (Example 2)", () => {
    let mockDeps = createMockDependencies();
    const SUBSCRIPTION = "subscription";
    mockDeps.gqlPubSub.asyncIterator = jest.fn(() => SUBSCRIPTION);
    const repo = repository(mockDeps);

    const ID = "Test 123";
    const subscription = repo.subscribeToLight(ID);

    expect(mockDeps.gqlPubSub.asyncIterator).toBeCalledWith(ID);
    expect(subscription).toBe(SUBSCRIPTION);
  });
});

describe("subscribeToAllLights", () => {
  test("Subscribes to all lights", () => {
    let mockDeps = createMockDependencies();
    const SUBSCRIPTION = "subscription";
    mockDeps.gqlPubSub.asyncIterator = jest.fn(() => SUBSCRIPTION);
    const repo = repository(mockDeps);

    const subscription = repo.subscribeToAllLights();

    expect(mockDeps.gqlPubSub.asyncIterator).toBeCalledWith("lightsChanged");
    expect(subscription).toBe(SUBSCRIPTION);
  });
});

describe("subscribeToLightsAdded", () => {
  test("Subscribes to lights added", () => {
    let mockDeps = createMockDependencies();
    const SUBSCRIPTION = "subscription";
    mockDeps.gqlPubSub.asyncIterator = jest.fn(() => SUBSCRIPTION);
    const repo = repository(mockDeps);

    const subscription = repo.subscribeToLightsAdded();

    expect(mockDeps.gqlPubSub.asyncIterator).toBeCalledWith("lightAdded");
    expect(subscription).toBe(SUBSCRIPTION);
  });
});

describe("subscribeToLightsRemoved", () => {
  test("Subscribes to lights removed", () => {
    let mockDeps = createMockDependencies();
    const SUBSCRIPTION = "subscription";
    mockDeps.gqlPubSub.asyncIterator = jest.fn(() => SUBSCRIPTION);
    const repo = repository(mockDeps);

    const subscription = repo.subscribeToLightsRemoved();

    expect(mockDeps.gqlPubSub.asyncIterator).toBeCalledWith("lightRemoved");
    expect(subscription).toBe(SUBSCRIPTION);
  });
});
