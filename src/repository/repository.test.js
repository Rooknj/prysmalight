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
  let mockGqlPubsub = {
    publish: jest.fn(),
    asyncIterator: jest.fn()
  };
  let mockEvent = {
    emit: jest.fn(),
    removeListener: jest.fn(),
    on: jest.fn()
  };
  return {
    db: mockDB,
    pubsub: mockPubsub,
    event: mockEvent,
    gqlPubSub: mockGqlPubsub
  };
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

describe("handleConnectMessage", () => {
  test("handles the connect message (Example 1)", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test C";
    const MESSAGE = { name: ID, connection: "2" };
    const changedLight = createMockLight(ID);
    mockDeps.db.getLight = jest.fn(() => ({
      error: null,
      light: changedLight
    }));
    const repo = repository(mockDeps);
    const error = await repo.handleConnectMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      connected: Number(MESSAGE.connection)
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.event.emit).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
  });
  test("handles the connect message (Example 2)", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test 1235";
    const MESSAGE = { name: ID, connection: "0" };
    const changedLight = createMockLight(ID);
    mockDeps.db.getLight = jest.fn(() => ({
      error: null,
      light: changedLight
    }));
    const repo = repository(mockDeps);
    const error = await repo.handleConnectMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      connected: Number(MESSAGE.connection)
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.event.emit).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
  });
  test("ignores the message and returns an error if no name is supplied", async () => {
    let mockDeps = createMockDependencies();
    const MESSAGE = { connection: "0" };
    const repo = repository(mockDeps);
    const error = await repo.handleConnectMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
  test("ignores the message and returns an error if the connection data is not in the correct format", async () => {
    let mockDeps = createMockDependencies();
    const MESSAGE = { dummy: "Q", matching: "Rocks" };
    const repo = repository(mockDeps);
    const error = await repo.handleConnectMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
  test("returns an error if it fails to change the light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test 1235";
    const MESSAGE = { name: ID, connection: "0" };
    mockDeps.db.setLight = jest.fn(() => new Error());
    const repo = repository(mockDeps);
    const error = await repo.handleConnectMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
  test("returns an error if it fails to get the changed light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test 1235";
    const MESSAGE = { name: ID, connection: "0" };
    mockDeps.db.getLight = jest.fn(() => ({ error: new Error() }));
    const repo = repository(mockDeps);
    const error = await repo.handleConnectMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.getLight).toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
});

describe("handleStateMessage", () => {
  test("handles the state message (Example 1)", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test C";
    const MESSAGE = {
      name: ID,
      mutationId: 56,
      state: "ON",
      brightness: 69,
      color: { r: 255, g: 90, b: 0 },
      effect: "None",
      speed: 5
    };
    const changedLight = createMockLight(ID);
    mockDeps.db.getLight = jest.fn(() => ({
      error: null,
      light: changedLight
    }));
    const repo = repository(mockDeps);
    const error = await repo.handleStateMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      state: MESSAGE.state,
      brightness: MESSAGE.brightness,
      color: MESSAGE.color,
      effect: MESSAGE.effect,
      speed: MESSAGE.speed
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.event.emit).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
    expect(mockDeps.event.emit).toBeCalledWith(
      "mutationResponse",
      MESSAGE.mutationId,
      changedLight
    );
  });
  test("handles the state message (Example 2)", async () => {
    let mockDeps = createMockDependencies();
    const ID = "ABCDE123C";
    const MESSAGE = {
      name: ID,
      mutationId: 3,
      state: "OFF",
      brightness: 69,
      color: { r: 100, g: 0, b: 255 },
      effect: "Cylon",
      speed: 1
    };
    const changedLight = createMockLight(ID);
    mockDeps.db.getLight = jest.fn(() => ({
      error: null,
      light: changedLight
    }));
    const repo = repository(mockDeps);
    const error = await repo.handleStateMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      state: MESSAGE.state,
      brightness: MESSAGE.brightness,
      color: MESSAGE.color,
      effect: MESSAGE.effect,
      speed: MESSAGE.speed
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.event.emit).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
    expect(mockDeps.event.emit).toBeCalledWith(
      "mutationResponse",
      MESSAGE.mutationId,
      changedLight
    );
  });
  test("ignores the message and returns an error if no name is supplied", async () => {
    let mockDeps = createMockDependencies();
    const MESSAGE = {
      mutationId: 3,
      state: "OFF",
      brightness: 69,
      color: { r: 100, g: 0, b: 255 },
      effect: "Cylon",
      speed: 1
    };
    const repo = repository(mockDeps);
    const error = await repo.handleStateMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
  test("ignores the message and returns an error if no state data is supplied", async () => {
    let mockDeps = createMockDependencies();
    const ID = "TES!!!";
    const MESSAGE = { name: ID, dummy: "Q", matching: "Rocks" };
    const repo = repository(mockDeps);
    const error = await repo.handleStateMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
  test("returns an error if it fails to change the light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "TES!!!";
    const MESSAGE = {
      name: ID,
      mutationId: 3,
      state: "OFF",
      brightness: 69,
      color: { r: 100, g: 0, b: 255 },
      effect: "Cylon",
      speed: 1
    };
    mockDeps.db.setLight = jest.fn(() => new Error());
    const repo = repository(mockDeps);
    const error = await repo.handleStateMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
  test("returns an error if it fails to get the changed light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "TES123";
    const MESSAGE = {
      name: ID,
      mutationId: 3,
      state: "OFF",
      brightness: 69,
      color: { r: 100, g: 0, b: 255 },
      effect: "Cylon",
      speed: 1
    };
    mockDeps.db.getLight = jest.fn(() => ({ error: new Error() }));
    const repo = repository(mockDeps);
    const error = await repo.handleStateMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.getLight).toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
});

describe("handleEffectListMessage", () => {
  test("handles the effect list message (Example 1)", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test Cde";
    const MESSAGE = { name: ID, effectList: ["Test A", "Test B", "Test C"] };
    const changedLight = createMockLight(ID);
    mockDeps.db.getLight = jest.fn(() => ({
      error: null,
      light: changedLight
    }));
    const repo = repository(mockDeps);
    const error = await repo.handleEffectListMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      supportedEffects: MESSAGE.effectList
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.event.emit).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
  });
  test("handles the effect list message (Example 2)", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test Cde";
    const MESSAGE = { name: ID, effectList: ["13", "bserbre", "Rockstarr!"] };
    const changedLight = createMockLight(ID);
    mockDeps.db.getLight = jest.fn(() => ({
      error: null,
      light: changedLight
    }));
    const repo = repository(mockDeps);
    const error = await repo.handleEffectListMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      supportedEffects: MESSAGE.effectList
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.event.emit).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
  });
  test("ignores the message and returns an error if no name is supplied", async () => {
    let mockDeps = createMockDependencies();
    const MESSAGE = { effectList: ["Test 1", "Test 2"] };
    const repo = repository(mockDeps);
    const error = await repo.handleEffectListMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
  test("ignores the message and returns an error if no effect list is supplied", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test Cde";
    const MESSAGE = { name: ID };
    const repo = repository(mockDeps);
    const error = await repo.handleEffectListMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
  test("returns an error if it fails to change the light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "TES!!!";
    const MESSAGE = { name: ID, effectList: ["13", "bserbre", "Rockstarr!"] };
    mockDeps.db.setLight = jest.fn(() => new Error());
    const repo = repository(mockDeps);
    const error = await repo.handleEffectListMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
  });
  test("returns an error if it fails to get the changed light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "TES123";
    const MESSAGE = { name: ID, effectList: ["13", "bserbre", "Rockstarr!"] };
    mockDeps.db.getLight = jest.fn(() => ({ error: new Error() }));
    const repo = repository(mockDeps);
    const error = await repo.handleEffectListMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.getLight).toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
    expect(mockDeps.event.emit).not.toBeCalled();
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

describe("removeLight", () => {
  test("removes the light with no errors", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    mockDeps.db.removeLight = jest.fn(async () => null);
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: null,
      hasLight: true
    }));
    const repo = repository(mockDeps);

    const response = await repo.removeLight(ID);

    expect(response).toEqual(ID);
    expect(mockDeps.db.removeLight).toBeCalledWith(ID);
    expect(mockDeps.pubsub.unsubscribeFromLight).toBeCalledWith(ID);
  });
  test("returns an error if the light was not already added", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    mockDeps.db.removeLight = jest.fn(async () => null);
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: null,
      hasLight: false
    }));
    const repo = repository(mockDeps);

    const response = await repo.removeLight(ID);

    expect(response).toBeInstanceOf(Error);
    expect(mockDeps.db.hasLight).toBeCalledWith(ID);
  });
  test("returns an error if it failed to check if the light was added", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    mockDeps.db.removeLight = jest.fn(async () => null);
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: new Error(),
      hasLight: true
    }));
    const repo = repository(mockDeps);

    const response = await repo.removeLight(ID);

    expect(response).toBeInstanceOf(Error);
    expect(mockDeps.db.hasLight).toBeCalledWith(ID);
  });
  test("returns an error if it failed to remove the light to the db", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    mockDeps.db.removeLight = jest.fn(async () => new Error());
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: null,
      hasLight: true
    }));
    const repo = repository(mockDeps);

    const response = await repo.removeLight(ID);

    expect(response).toBeInstanceOf(Error);
    expect(mockDeps.db.hasLight).toBeCalledWith(ID);
  });
});

// TODO: Figure out how to test with timers and actual event listeners
describe.skip("setLight", () => {
  test("correctly sets the light (Example 1)", async () => {});
  test("correctly sets the light (Example 2)", async () => {});
  test("returns an error if the light was not added", async () => {});
  test("returns an error if it fails to check if the light was added", async () => {});
  test("returns an error if the light was not added", async () => {});
  test("returns an error if fails to publish to the light", async () => {});
  test.skip("returns an error if takes too long for the light to respond", async () => {});
});
