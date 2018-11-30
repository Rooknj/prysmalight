const repository = require("./repository");
const rxjs = require("rxjs");

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

describe("repository", () => {
  test("Subscribes once to all relavent observables upon creation", () => {
    let mockDeps = createMockDependencies();

    repository(mockDeps);

    expect(mockDeps.db.connections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.db.disconnections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.connections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.disconnections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.connectMessages.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.stateMessages.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.effectMessages.subscribe).toBeCalledTimes(1);
  });
  test.skip("connects once the db and pubsub are connected", () => {});
  test.skip("does not attempt to connect if only the db connects", () => {});
  test.skip("does not attempt to connect if only the pubsub connects", () => {});
  test.skip("sets connected property to false if the db disconnects", () => {});
  test.skip("sets connected property to false if the pubsub disconnects", () => {});
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

describe.skip("addLight", () => {
  test("Test", async () => {});
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
