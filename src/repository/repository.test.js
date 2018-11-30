const repository = require("./repository");
const rxjs = require("rxjs");

// Creates a mock db
const createMockDependencies = () => {
  const mockLight = {
    id: "Mock Service Light 1",
    connected: true,
    state: "ON",
    brightness: 72,
    color: { r: 0, g: 127, b: 255 },
    effect: "None",
    speed: 3,
    supportedEffects: ["Effect 1", "Effect 2", "Effect 3"]
  };

  let mockDB = {
    connected: true,
    connections: { subscribe: jest.fn() },
    disconnections: { subscribe: jest.fn() },
    getAllLights: jest.fn(async () => ({
      error: null,
      lights: [mockLight]
    })),
    getLight: jest.fn(async () => ({
      error: null,
      light: mockLight
    })),
    setLight: jest.fn(async () => {}),
    addLight: jest.fn(async () => {}),
    removeLight: jest.fn(async () => {}),
    hasLight: jest.fn(async () => {})
  };
  let mockPubsub = {
    connected: true,
    connections: { subscribe: jest.fn() },
    disconnections: { subscribe: jest.fn() },
    allMessages: { subscribe: jest.fn() },
    connectMessages: { subscribe: jest.fn() },
    stateMessages: { subscribe: jest.fn() },
    effectMessages: { subscribe: jest.fn() },
    subscribeToLight: jest.fn(async () => {}),
    unsubscribeFromLight: jest.fn(async () => {}),
    publishToLight: jest.fn(async () => {})
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
      { id: "Test A" },
      { id: "Test 2" },
      { id: "qwerty123" }
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
    const MOCKLIGHTS = [{ id: "Test B" }, { id: "Test 999" }];
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

describe.skip("getLight", () => {
  test("Gets the light with the specified id (Example 1)", async () => {});
  test("Gets the light with the specified id (Example 2)", async () => {});
  test("Returns an error if the light isn't added", async () => {});
  test("Returns an error if it fails to check if the light was added", async () => {});
  test("Returns an error if it fails to get the light", async () => {});
});

describe.skip("getLights", () => {
  test("Gets all the lights", async () => {});
  test("returns an error if it fails to get all the lights", async () => {});
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

describe.skip("subscribeToLight", () => {
  test("Test", () => {});
});

describe.skip("subscribeToAllLights", () => {
  test("Test", () => {});
});

describe.skip("subscribeToLightAdded", () => {
  test("Test", () => {});
});

describe.skip("subscribeToLightRemoved", () => {
  test("Test", () => {});
});
