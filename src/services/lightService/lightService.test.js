const createLightService = require("./lightService");
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
    configMessages: { subscribe: jest.fn() },
    subscribeToLight: jest.fn(async id => null),
    unsubscribeFromLight: jest.fn(async id => null),
    publishToLight: jest.fn(async (id, topic) => null),
    startDiscovery: () => {}
  };
  let mockGqlPubsub = {
    publish: jest.fn(),
    asyncIterator: jest.fn()
  };
  let mockMediator = {
    publish: jest.fn(),
    subscribe: jest.fn(),
    onRpcMessage: jest.fn(),
    sendRpcMessage: jest.fn()
  };
  return {
    db: mockDB,
    pubsub: mockPubsub,
    mediator: mockMediator,
    gqlPubSub: mockGqlPubsub
  };
};

describe("createLightService & init", () => {
  test("Subscribes once to all relavent observables upon creation", () => {
    let mockDeps = createMockDependencies();

    let lightService = createLightService(mockDeps);
    lightService.init();

    expect(mockDeps.db.connections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.db.disconnections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.connections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.disconnections.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.connectMessages.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.stateMessages.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.effectMessages.subscribe).toBeCalledTimes(1);
    expect(mockDeps.pubsub.configMessages.subscribe).toBeCalledTimes(1);
  });
  test("attempts to connect when the db connects", () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.connected = false;
    mockDeps.pubsub.connected = false;
    const eventEmitter = new events.EventEmitter();
    mockDeps.db.connections = rxjs.fromEvent(eventEmitter, "dbConnect");

    let lightService = createLightService(mockDeps);
    lightService.__proto__.connect = jest.fn();
    lightService.init();

    eventEmitter.emit("dbConnect");

    expect(lightService.connect).toBeCalledTimes(1);
  });
  test("attempts to connect when the pubsub connects", () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.connected = false;
    mockDeps.pubsub.connected = false;
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.connections = rxjs.fromEvent(eventEmitter, "pubsubConnect");

    let lightService = createLightService(mockDeps);
    lightService.__proto__.connect = jest.fn();
    lightService.init();

    eventEmitter.emit("pubsubConnect");

    expect(lightService.connect).toBeCalledTimes(1);
  });
  test("sets connected property to false if the db disconnects", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.disconnections = rxjs.fromEvent(
      eventEmitter,
      "pubsubDisonnect"
    );

    let lightService = createLightService(mockDeps);
    lightService.init();

    eventEmitter.emit("pubsubDisonnect");

    expect(lightService.connected).toBe(false);
  });
  test("sets connected property to false if the pubsub disconnects", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.db.disconnections = rxjs.fromEvent(eventEmitter, "dbDisonnect");

    let lightService = createLightService(mockDeps);
    lightService.init();

    eventEmitter.emit("dbDisonnect");

    expect(lightService.connected).toBe(false);
  });
  test("handles connected messages when received", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.connectMessages = rxjs.fromEvent(
      eventEmitter,
      "connectMessage"
    );

    let lightService = createLightService(mockDeps);
    lightService.__proto__.handleConnectMessage = jest.fn();
    lightService.init();

    const MESSAGE = "message";
    eventEmitter.emit("connectMessage", MESSAGE);

    expect(lightService.handleConnectMessage).toBeCalledTimes(1);
    expect(lightService.handleConnectMessage).toBeCalledWith(MESSAGE);
  });
  test("handles state messages when received", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.stateMessages = rxjs.fromEvent(
      eventEmitter,
      "connectMessage"
    );

    let lightService = createLightService(mockDeps);
    lightService.__proto__.handleStateMessage = jest.fn();
    lightService.init();

    const MESSAGE = "message";
    eventEmitter.emit("connectMessage", MESSAGE);

    expect(lightService.handleStateMessage).toBeCalledTimes(1);
    expect(lightService.handleStateMessage).toBeCalledWith(MESSAGE);
  });
  test("handles effect list messages when received", () => {
    let mockDeps = createMockDependencies();
    const eventEmitter = new events.EventEmitter();
    mockDeps.pubsub.effectMessages = rxjs.fromEvent(
      eventEmitter,
      "effectListMessage"
    );

    let lightService = createLightService(mockDeps);
    lightService.__proto__.handleEffectListMessage = jest.fn();
    lightService.init();

    const MESSAGE = "message";
    eventEmitter.emit("effectListMessage", MESSAGE);

    expect(lightService.handleEffectListMessage).toBeCalledTimes(1);
    expect(lightService.handleEffectListMessage).toBeCalledWith(MESSAGE);
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
    const lightService = createLightService(mockDeps);

    const error = await lightService.connect();

    expect(error).toBeNull();
    expect(mockDeps.db.getAllLights).toBeCalled();
    expect(mockDeps.pubsub.subscribeToLight).toBeCalledTimes(MOCKLIGHTS.length);
    MOCKLIGHTS.forEach(light => {
      expect(mockDeps.pubsub.subscribeToLight).toBeCalledWith(light.id);
    });
    expect(lightService.connected).toBe(true);
  });
  test("subscribes to all added lights then sets connected to true (Example 2)", async () => {
    let mockDeps = createMockDependencies();
    const MOCKLIGHTS = [createMockLight("Test B"), createMockLight("999")];
    mockDeps.db.getAllLights = jest.fn(async () => ({
      error: null,
      lights: MOCKLIGHTS
    }));
    const lightService = createLightService(mockDeps);

    const error = await lightService.connect();

    expect(error).toBeNull();
    expect(mockDeps.db.getAllLights).toBeCalled();
    expect(mockDeps.pubsub.subscribeToLight).toBeCalledTimes(MOCKLIGHTS.length);
    MOCKLIGHTS.forEach(light => {
      expect(mockDeps.pubsub.subscribeToLight).toBeCalledWith(light.id);
    });
    expect(lightService.connected).toBe(true);
  });
  test("returns an error if the db is not connected", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.connected = false;
    const lightService = createLightService(mockDeps);

    const error = await lightService.connect();

    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if the pubsub is not connected", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.pubsub.connected = false;
    const lightService = createLightService(mockDeps);

    const error = await lightService.connect();

    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error and does not set connected to true if an error occurs while getting all lights", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.getAllLights = jest.fn(async () => ({
      error: new Error()
    }));
    const lightService = createLightService(mockDeps);

    const error = await lightService.connect();

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.getAllLights).toBeCalled();
    expect(lightService.connected).toBe(false);
  });
  test("returns an error and does not set connected to true if an error occurs while subscribing", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.pubsub.subscribeToLight = jest.fn(async () => new Error());
    const lightService = createLightService(mockDeps);

    const error = await lightService.connect();

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.pubsub.subscribeToLight).toBeCalled();
    expect(lightService.connected).toBe(false);
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
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleConnectMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      connected: Number(MESSAGE.connection)
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.mediator.publish).toBeCalledWith("lightChanged", {
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
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleConnectMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      connected: Number(MESSAGE.connection)
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.mediator.publish).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
  });
  test("ignores the message and returns an error if no name is supplied", async () => {
    let mockDeps = createMockDependencies();
    const MESSAGE = { connection: "0" };
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleConnectMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
  });
  test("ignores the message and returns an error if the connection data is not in the correct format", async () => {
    let mockDeps = createMockDependencies();
    const MESSAGE = { dummy: "Q", matching: "Rocks" };
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleConnectMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
  });
  test("returns an error if it fails to change the light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test 1235";
    const MESSAGE = { name: ID, connection: "0" };
    mockDeps.db.setLight = jest.fn(() => new Error());
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleConnectMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
  });
  test("returns an error if it fails to get the changed light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test 1235";
    const MESSAGE = { name: ID, connection: "0" };
    mockDeps.db.getLight = jest.fn(() => ({ error: new Error() }));
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleConnectMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.getLight).toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
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
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleStateMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      state: MESSAGE.state,
      brightness: MESSAGE.brightness,
      color: MESSAGE.color,
      effect: MESSAGE.effect,
      speed: MESSAGE.speed
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.mediator.publish).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
    expect(mockDeps.mediator.publish).toBeCalledWith("mutationResponse", {
      mutationId: MESSAGE.mutationId,
      changedLight
    });
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
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleStateMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      state: MESSAGE.state,
      brightness: MESSAGE.brightness,
      color: MESSAGE.color,
      effect: MESSAGE.effect,
      speed: MESSAGE.speed
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.mediator.publish).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
    expect(mockDeps.mediator.publish).toBeCalledWith("mutationResponse", {
      mutationId: MESSAGE.mutationId,
      changedLight
    });
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
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleStateMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
  });
  test("ignores the message and returns an error if no state data is supplied", async () => {
    let mockDeps = createMockDependencies();
    const ID = "TES!!!";
    const MESSAGE = { name: ID, dummy: "Q", matching: "Rocks" };
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleStateMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
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
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleStateMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
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
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleStateMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.getLight).toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
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
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleEffectListMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      supportedEffects: MESSAGE.effectList
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.mediator.publish).toBeCalledWith("lightChanged", {
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
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleEffectListMessage(MESSAGE);

    expect(error).toBeNull;
    expect(mockDeps.db.setLight).toBeCalledWith(MESSAGE.name, {
      supportedEffects: MESSAGE.effectList
    });
    expect(mockDeps.db.getLight).toBeCalledWith(MESSAGE.name);
    expect(mockDeps.mediator.publish).toBeCalledWith("lightChanged", {
      lightChanged: changedLight
    });
  });
  test("ignores the message and returns an error if no name is supplied", async () => {
    let mockDeps = createMockDependencies();
    const MESSAGE = { effectList: ["Test 1", "Test 2"] };
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleEffectListMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
  });
  test("ignores the message and returns an error if no effect list is supplied", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test Cde";
    const MESSAGE = { name: ID };
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleEffectListMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).not.toBeCalled();
    expect(mockDeps.db.getLight).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
  });
  test("returns an error if it fails to change the light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "TES!!!";
    const MESSAGE = { name: ID, effectList: ["13", "bserbre", "Rockstarr!"] };
    mockDeps.db.setLight = jest.fn(() => new Error());
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleEffectListMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.setLight).toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
  });
  test("returns an error if it fails to get the changed light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "TES123";
    const MESSAGE = { name: ID, effectList: ["13", "bserbre", "Rockstarr!"] };
    mockDeps.db.getLight = jest.fn(() => ({ error: new Error() }));
    const lightService = createLightService(mockDeps);
    const error = await lightService.handleEffectListMessage(MESSAGE);

    expect(error).toBeInstanceOf(Error);
    expect(mockDeps.db.getLight).toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
    expect(mockDeps.mediator.publish).not.toBeCalled();
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
    const lightService = createLightService(mockDeps);

    const response = await lightService.getLight(ID);

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
    const lightService = createLightService(mockDeps);

    const response = await lightService.getLight(ID);

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
    const lightService = createLightService(mockDeps);

    const response = await lightService.getLight(ID);

    expect(response).toBeInstanceOf(Error);
  });
  test("Returns an error if it fails to check if the light was added", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test QREWO";
    mockDeps.db.hasLight = jest.fn(async () => ({
      error: new Error(),
      hasLight: null
    }));
    const lightService = createLightService(mockDeps);

    const response = await lightService.getLight(ID);

    expect(response).toBeInstanceOf(Error);
  });
  test("Returns an error if it fails to get the light", async () => {
    let mockDeps = createMockDependencies();
    const ID = "Test A";
    mockDeps.db.getLight = jest.fn(async () => ({
      error: new Error(),
      light: null
    }));
    const lightService = createLightService(mockDeps);

    const response = await lightService.getLight(ID);

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
    const lightService = createLightService(mockDeps);

    const response = await lightService.getLights();

    expect(response).toEqual(MOCKLIGHTS);
    expect(mockDeps.db.getAllLights).toBeCalled();
  });
  test("returns an error if it fails to get all the lights", async () => {
    let mockDeps = createMockDependencies();
    mockDeps.db.getAllLights = jest.fn(async () => ({
      error: new Error(),
      lights: null
    }));
    const lightService = createLightService(mockDeps);

    const response = await lightService.getLights();

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
    const lightService = createLightService(mockDeps);
    lightService.__proto__.getLight = jest.fn(() => MOCKLIGHT);

    const response = await lightService.addLight(ID);

    expect(response).toBe(MOCKLIGHT);
    expect(mockDeps.db.addLight).toBeCalledWith(ID, null);
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
    const lightService = createLightService(mockDeps);
    lightService.__proto__.getLight = jest.fn();

    const response = await lightService.addLight(ID);

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
    const lightService = createLightService(mockDeps);
    lightService.__proto__.getLight = jest.fn();

    const response = await lightService.addLight(ID);

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
    const lightService = createLightService(mockDeps);
    lightService.__proto__.getLight = jest.fn();

    const response = await lightService.addLight(ID);

    expect(response).toBeInstanceOf(Error);
    expect(mockDeps.db.addLight).toBeCalledWith(ID, null);
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
    const lightService = createLightService(mockDeps);

    const response = await lightService.removeLight(ID);

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
    const lightService = createLightService(mockDeps);

    const response = await lightService.removeLight(ID);

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
    const lightService = createLightService(mockDeps);

    const response = await lightService.removeLight(ID);

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
    const lightService = createLightService(mockDeps);

    const response = await lightService.removeLight(ID);

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
