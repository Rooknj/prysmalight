const dbFactory = require("./dbFactory");
const { isObservable } = require("rxjs");

// Creates a mock client which will return successful responses but no data
const createMockClient = () => {
  const err = null;
  const result = null;
  // Each function models the arguments taken by the actual Redis Client functions
  // cb is the callback function which is necessary for dbFactory's promisify code to work.
  return {
    on: jest.fn(() => {}),
    SMEMBERS: jest.fn((key, cb) => cb(err, result)),
    SADD: jest.fn((key, val, cb) => cb(err, result)),
    INCR: jest.fn((key, cb) => cb(err, 2)),
    ZADD: jest.fn((key, score, val, cb) => cb(err, 1)),
    ZREM: jest.fn((key, val, cb) => cb(err, 1)),
    ZSCORE: jest.fn((key, val, cb) => cb(err, 1)),
    ZRANGE: jest.fn((key, low, high, cb) => cb(err, [])),
    HMSET: jest.fn((arr, cb) => cb(err, "OK")),
    DEL: jest.fn((key, cb) => cb(err, 1)),
    HGETALL: jest.fn((key, cb) => cb(err, result)),
    BGSAVE: jest.fn(),
    connected: true
  };
};

describe("connections", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    expect(db.connections).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    expect(isObservable(db.connections)).toBe(true);
  });
});

describe("disconnections", () => {
  test("is defined", () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    expect(db.disconnections).toBeDefined();
  });

  test("is an observable", () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    expect(isObservable(db.disconnections)).toBe(true);
  });
});

// TODO: Add config info to getLight expect statements
describe("getLight", () => {
  // Solid Tests
  test("returns a javascript object in the correct format (Example 1)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A",
      CONNECTED = "2",
      STATE = "OFF",
      BRIGHTNESS = "100",
      RED = "165",
      GREEN = "0",
      BLUE = "255",
      EFFECT = "None",
      SPEED = "4",
      EFFECTSKEY = "Test: effects",
      EFFECTSLIST = ["Test 1", "Test 2", "Test 3"];
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        connected: CONNECTED,
        state: STATE,
        brightness: BRIGHTNESS,
        "color:red": RED,
        "color:green": GREEN,
        "color:blue": BLUE,
        effect: EFFECT,
        speed: SPEED,
        effectsKey: EFFECTSKEY
      })
    );
    mockClient.SMEMBERS = jest.fn((_, cb) => cb(null, EFFECTSLIST));
    const db = dbFactory(mockClient);

    // Call getLight
    const { error, light } = await db.getLight(ID);

    // Check to make sure no error was returned and that light contains the correct data
    expect(error).toBeNull();
    expect(light).toEqual(
      expect.objectContaining({
        id: ID,
        connected: CONNECTED,
        state: STATE,
        brightness: parseInt(BRIGHTNESS),
        color: {
          r: parseInt(RED),
          g: parseInt(GREEN),
          b: parseInt(BLUE)
        },
        effect: EFFECT,
        speed: parseInt(SPEED),
        supportedEffects: EFFECTSLIST
      })
    );
  });
  test("returns a javascript object in the correct format (Example 2)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test B",
      CONNECTED = "0",
      STATE = "ON",
      BRIGHTNESS = "2",
      RED = "0",
      GREEN = "255",
      BLUE = "213",
      EFFECT = "Dancing Dancing Dancing",
      SPEED = "7",
      EFFECTSKEY = "Test: effects2",
      EFFECTSLIST = ["Test A", "Test B", "Test C"];
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        connected: CONNECTED,
        state: STATE,
        brightness: BRIGHTNESS,
        "color:red": RED,
        "color:green": GREEN,
        "color:blue": BLUE,
        effect: EFFECT,
        speed: SPEED,
        effectsKey: EFFECTSKEY
      })
    );
    mockClient.SMEMBERS = jest.fn((_, cb) => cb(null, EFFECTSLIST));
    const db = dbFactory(mockClient);

    // Call getLight
    const { error, light } = await db.getLight(ID);

    // Check to make sure no error was returned and that light contains the correct data
    expect(error).toBeNull();
    expect(light).toEqual(
      expect.objectContaining({
        id: ID,
        connected: CONNECTED,
        state: STATE,
        brightness: parseInt(BRIGHTNESS),
        color: {
          r: parseInt(RED),
          g: parseInt(GREEN),
          b: parseInt(BLUE)
        },
        effect: EFFECT,
        speed: parseInt(SPEED),
        supportedEffects: EFFECTSLIST
      })
    );
  });
  test("returns an error if the redis client is not connected", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);

    // Set the mockClient to be disconnected
    mockClient.connected = false;

    // Call getLight
    const { error } = await db.getLight("Test Disconnected");

    // Check that the error is returned
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if no id was provided", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const { error } = await db.getLight();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to get the light data (HGETALL)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    mockClient.HGETALL = jest.fn((_, cb) => cb(new Error("Test Error")));
    const db = dbFactory(mockClient);

    // Call getLight
    const { error } = await db.getLight("Test A");

    // Check that an error is returned
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if the light has no data associated with it (HGETALL returns null)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    mockClient.HGETALL = jest.fn((_, cb) => cb(null, null));
    const db = dbFactory(mockClient);

    // Call getLight
    const { error } = await db.getLight("Test A");

    // Check that an error is returned
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to get the Effect List (SMEMBERS)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const EFFECTSKEY = "Test: effects";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        effectsKey: EFFECTSKEY
      })
    );
    mockClient.SMEMBERS = jest.fn((_, cb) => cb(new Error("Test Error")));
    const db = dbFactory(mockClient);

    // Call getLight
    const { error } = await db.getLight("Test A");

    // Check to make sure an error was returned
    expect(error).toBeInstanceOf(Error);
  });

  // Unsure if these are necessary
  test("calls HGETALL with the correct parameters", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A";
    const db = dbFactory(mockClient);

    // Call getLight
    await db.getLight(ID);

    // Check that HGETALL was called with the correct parameters
    expect(mockClient.HGETALL).toHaveBeenCalled();
    expect(mockClient.HGETALL).toHaveBeenCalledWith(ID, expect.anything());
  });
  test("calls SMEMBERS with the correct parameters", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const EFFECTSKEY = "Test: effects";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        effectsKey: EFFECTSKEY
      })
    );
    const db = dbFactory(mockClient);

    // Call getLight
    await db.getLight("Test A");

    // Check to make sure SMEMBERS was called
    expect(mockClient.SMEMBERS).toHaveBeenCalled();
    expect(mockClient.SMEMBERS).toHaveBeenCalledWith(
      EFFECTSKEY,
      expect.anything() // This is in place of the callback function
    );
  });
  test("returns the correct state", async () => {
    let mockClient = createMockClient();
    const STATE = "ON";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        state: STATE
      })
    );
    const db = dbFactory(mockClient);
    const { error, light } = await db.getLight("Test A");
    expect(error).toBeNull();
    expect(light).not.toBeNull();
    expect(light.state).toBe(STATE);
  });
  test("returns the correct brightness", async () => {
    let mockClient = createMockClient();
    const BRIGHTNESS = "69";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        brightness: BRIGHTNESS
      })
    );
    const db = dbFactory(mockClient);
    const { error, light } = await db.getLight("Test A");
    expect(error).toBeNull();
    expect(light).not.toBeNull();
    expect(light.brightness).toBe(parseInt(BRIGHTNESS));
  });
  test("returns the correct effect", async () => {
    let mockClient = createMockClient();
    const EFFECT = "Dancing Dancing Dancing";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        effect: EFFECT
      })
    );
    const db = dbFactory(mockClient);
    const { error, light } = await db.getLight("Test A");
    expect(error).toBeNull();
    expect(light).not.toBeNull();
    expect(light.effect).toBe(EFFECT);
  });
  test("returns the correct speed", async () => {
    let mockClient = createMockClient();
    const SPEED = "3";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        speed: SPEED
      })
    );
    const db = dbFactory(mockClient);
    const { error, light } = await db.getLight("Test A");
    expect(error).toBeNull();
    expect(light).not.toBeNull();
    expect(light.speed).toBe(parseInt(SPEED));
  });
  test("returns the correct color", async () => {
    let mockClient = createMockClient();
    const RED = "165",
      GREEN = "0",
      BLUE = "255";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        "color:red": RED,
        "color:green": GREEN,
        "color:blue": BLUE
      })
    );
    const db = dbFactory(mockClient);
    const { error, light } = await db.getLight("Test A");
    expect(error).toBeNull();
    expect(light).not.toBeNull();
    expect(light.color).toBeDefined();
    expect(light.color.r).toBe(parseInt(RED));
    expect(light.color.g).toBe(parseInt(GREEN));
    expect(light.color.b).toBe(parseInt(BLUE));
  });
  test("returns the correct effect list in the correct order", async () => {
    let mockClient = createMockClient();
    const EFFECTSLIST = ["Test 1", "Test 2", "Test 3"];
    const EFFECTSKEY = "Test: effects";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        effectsKey: EFFECTSKEY
      })
    );
    mockClient.SMEMBERS = jest.fn((_, cb) => cb(null, EFFECTSLIST));
    const db = dbFactory(mockClient);
    const { error, light } = await db.getLight("Test A");
    expect(error).toBeNull();
    expect(light).not.toBeNull();
    expect(light.supportedEffects).toEqual(EFFECTSLIST);
  });
});

describe("getAllLights", () => {
  test("returns an array containing all lights in the database (Example 1)", async () => {
    // Create mocks and db
    const LIGHTKEYS = ["Test 1", "Test 2", "Test 3"];
    let mockClient = createMockClient();
    mockClient.ZRANGE = jest.fn((key, low, high, cb) => cb(null, LIGHTKEYS));
    const db = dbFactory(mockClient);

    // Mock out db's getLight method
    // Note: You have to change the prototype method because we are creating the object using Object.create()
    db.__proto__.getLight = jest.fn(id => ({ error: null, light: { id } }));

    // Call getAllLights
    const { error, lights } = await db.getAllLights();

    // Check to make sure there were no errors and lights is what we expect it to be
    expect(error).toBeNull();
    expect(lights).toEqual(LIGHTKEYS.map(key => ({ id: key })));
  });
  test("returns an array containing all lights in the database (Example 2)", async () => {
    // Create mocks and db
    const LIGHTKEYS = ["Test A", "Test B", "Test C"];
    let mockClient = createMockClient();
    mockClient.ZRANGE = jest.fn((key, low, high, cb) => cb(null, LIGHTKEYS));
    const db = dbFactory(mockClient);

    // Mock out db's getLight method
    // Note: You have to change the prototype method because we are creating the object using Object.create()
    db.__proto__.getLight = jest.fn(id => ({ error: null, light: { id } }));

    // Call getAllLights
    const { error, lights } = await db.getAllLights();

    // Check to make sure there were no errors and lights is what we expect it to be
    expect(error).toBeNull();
    expect(lights).toEqual(LIGHTKEYS.map(key => ({ id: key })));
  });
  test("returns an empty array there are no lights in the database", async () => {
    // Create mocks and db
    const LIGHTKEYS = [];
    let mockClient = createMockClient();
    mockClient.ZRANGE = jest.fn((key, low, high, cb) => cb(null, LIGHTKEYS));
    const db = dbFactory(mockClient);

    // Mock out db's getLight method
    // Note: You have to change the prototype method because we are creating the object using Object.create()
    db.__proto__.getLight = jest.fn(id => ({ error: null, light: { id } }));

    // Call getAllLights
    const { error, lights } = await db.getAllLights();

    // Check to make sure there were no errors and lights is what we expect it to be
    expect(error).toBeNull();
    expect(lights).toEqual([]);
  });
  test("returns an error if at least one of the lights was not able to be fetched", async () => {
    // Create mocks and db
    const LIGHTKEYS = ["Test A", "Test B", "Test C"];
    let mockClient = createMockClient();
    mockClient.ZRANGE = jest.fn((key, low, high, cb) => cb(null, LIGHTKEYS));
    const db = dbFactory(mockClient);

    // Mock out db's getLight method so it returns an error
    // Note: You have to change the prototype method because we are creating the object using Object.create()
    db.__proto__.getLight = jest.fn(() => ({ error: new Error("Test Error") }));

    // Call getAllLights
    const { error } = await db.getAllLights();

    // Check to make sure there was an error returned
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if the redis client is not connected", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    mockClient.connected = false;
    const { error } = await db.getAllLights();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to get the light keys (ZRANGE)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    mockClient.ZRANGE = jest.fn((key, low, high, cb) =>
      cb(new Error("Test Error"))
    );
    const db = dbFactory(mockClient);

    // Call getAllLights
    const { error } = await db.getAllLights();

    // Check to make sure there was an error returned
    expect(error).toBeInstanceOf(Error);
  });
  test("calls ZRANGE with the correct parameters", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    db.getLight = jest.fn(id => id);
    await db.getAllLights();
    expect(mockClient.ZRANGE).toHaveBeenCalled();
    expect(mockClient.ZRANGE).toHaveBeenCalledWith(
      "lightKeys",
      0,
      -1,
      expect.anything()
    );
  });
});

describe("setLight", () => {
  test("correctly sets the light and returns no error (Example 1)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A",
      CONNECTED = "2",
      STATE = "OFF",
      BRIGHTNESS = "100",
      RED = "165",
      GREEN = "0",
      BLUE = "255",
      EFFECT = "None",
      SPEED = "4",
      EFFECTSLIST = ["Test 1", "Test 2", "Test 3"];
    const lightData = {
      connected: CONNECTED,
      state: STATE,
      brightness: BRIGHTNESS,
      color: { r: RED, g: GREEN, b: BLUE },
      effect: EFFECT,
      speed: SPEED,
      supportedEffects: EFFECTSLIST
    };
    const db = dbFactory(mockClient);

    // Call setLight
    const error = await db.setLight(ID, lightData);

    // Check to make sure no error was returned and that light contains the correct data
    expect(error).toBeNull();
    expect(mockClient.SADD).toHaveBeenCalled();
    expect(mockClient.SADD).toHaveBeenCalledWith(
      `${ID}:effects`,
      EFFECTSLIST,
      expect.anything()
    );
    expect(mockClient.HMSET).toHaveBeenCalled();
    expect(mockClient.HMSET).toHaveBeenCalledWith(
      expect.arrayContaining([
        ID,
        "connected",
        CONNECTED,
        "state",
        STATE,
        "brightness",
        BRIGHTNESS,
        "effect",
        EFFECT,
        "speed",
        SPEED,
        "color:red",
        RED,
        "color:green",
        GREEN,
        "color:blue",
        BLUE,
        "effectsKey",
        `${ID}:effects`
      ]),
      expect.anything()
    );
  });
  test("correctly sets the light and returns no error (Example 2)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test B",
      CONNECTED = "0",
      STATE = "ON",
      BRIGHTNESS = "30",
      RED = "0",
      GREEN = "255",
      BLUE = "142",
      EFFECT = "Test Effect",
      SPEED = "7",
      EFFECTSLIST = ["Test A", "Test B", "Test C"];
    const lightData = {
      connected: CONNECTED,
      state: STATE,
      brightness: BRIGHTNESS,
      color: { r: RED, g: GREEN, b: BLUE },
      effect: EFFECT,
      speed: SPEED,
      supportedEffects: EFFECTSLIST
    };
    const db = dbFactory(mockClient);

    // Call setLight
    const error = await db.setLight(ID, lightData);

    // Check to make sure no error was returned and that light contains the correct data
    expect(error).toBeNull();
    expect(mockClient.SADD).toHaveBeenCalled();
    expect(mockClient.SADD).toHaveBeenCalledWith(
      `${ID}:effects`,
      EFFECTSLIST,
      expect.anything()
    );
    expect(mockClient.HMSET).toHaveBeenCalled();
    expect(mockClient.HMSET).toHaveBeenCalledWith(
      expect.arrayContaining([
        ID,
        "connected",
        CONNECTED,
        "state",
        STATE,
        "brightness",
        BRIGHTNESS,
        "effect",
        EFFECT,
        "speed",
        SPEED,
        "color:red",
        RED,
        "color:green",
        GREEN,
        "color:blue",
        BLUE,
        "effectsKey",
        `${ID}:effects`
      ]),
      expect.anything()
    );
  });
  test("does not change data that isn't provided", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test Not",
      STATE = "ON",
      EFFECT = "Test Effect";
    const lightData = {
      state: STATE,
      effect: EFFECT
    };
    const db = dbFactory(mockClient);

    // Call setLight
    const error = await db.setLight(ID, lightData);

    // Check to make sure no error was returned and that light contains the correct data and does not contain extra data
    expect(error).toBeNull();
    expect(mockClient.SADD).not.toHaveBeenCalled();
    expect(mockClient.HMSET).toHaveBeenCalled();
    expect(mockClient.HMSET).toHaveBeenCalledWith(
      [ID, "state", STATE, "effect", EFFECT],
      expect.anything()
    );
  });
  test("ignores provided data that is not light data", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test B",
      CONNECTED = "0",
      RANDOM = "QWERTY";
    const lightData = {
      connected: CONNECTED,
      random: RANDOM
    };
    const db = dbFactory(mockClient);

    // Call setLight
    const error = await db.setLight(ID, lightData);

    // Check to make sure no error was returned and that light contains the correct data and does not contain the random data
    expect(error).toBeNull();
    expect(mockClient.HMSET).toHaveBeenCalled();
    expect(mockClient.HMSET).toHaveBeenCalledWith(
      [ID, "connected", CONNECTED],
      expect.anything()
    );
  });
  test("returns an error if the redis client is not connected", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const ID = "Test B",
      CONNECTED = "0";
    const lightData = {
      connected: CONNECTED
    };
    mockClient.connected = false;
    const error = await db.setLight(ID, lightData);
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if no id is provided", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    mockClient.connected = false;
    const error = await db.setLight();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if no data to set is provided", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const ID = "Test B";
    const error = await db.setLight(ID);
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if none of the provided data was light data", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const ID = "Test B",
      RANDOM1 = "QWERTY",
      RANDOM2 = "UIOP",
      RANDOM3 = "ASDF";
    const lightData = {
      random1: RANDOM1,
      random2: RANDOM2,
      random3: RANDOM3
    };
    const error = await db.setLight(ID, lightData);
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to set the Effect List (SADD)", async () => {
    let mockClient = createMockClient();
    mockClient.SADD = jest.fn((key, val, cb) => cb(new Error()));
    const db = dbFactory(mockClient);
    const ID = "Test B",
      EFFECTSLIST = ["Test 1", "Test 2", "Test 3"];
    const lightData = {
      supportedEffects: EFFECTSLIST
    };
    const error = await db.setLight(ID, lightData);
    expect(mockClient.SADD).toHaveBeenCalled();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to set the light data (HMSET)", async () => {
    let mockClient = createMockClient();
    mockClient.HMSET = jest.fn((key, val, cb) => cb(new Error()));
    const db = dbFactory(mockClient);
    const ID = "Test B",
      CONNECTED = "ON";
    const lightData = {
      connected: CONNECTED
    };
    const error = await db.setLight(ID, lightData);
    expect(mockClient.HMSET).toHaveBeenCalled();
    expect(error).toBeInstanceOf(Error);
  });
  test("correctly sets the light effect list in the correct order", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A",
      EFFECTSLIST = ["Test 1", "Test 2", "Test 3"];
    const lightData = {
      supportedEffects: EFFECTSLIST
    };
    const db = dbFactory(mockClient);

    // Call setLight
    const error = await db.setLight(ID, lightData);

    // Check to make sure no error was returned and that light contains the correct data
    expect(error).toBeNull();
    expect(mockClient.SADD).toHaveBeenCalled();
    expect(mockClient.SADD).toHaveBeenCalledWith(
      `${ID}:effects`,
      EFFECTSLIST,
      expect.anything()
    );
  });
});

describe("addLight", () => {
  test("correctly adds the light and returns no error (Example 1)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A";
    const LIGHTSCORE = 5;
    mockClient.INCR = jest.fn((key, cb) => cb(null, LIGHTSCORE));
    const db = dbFactory(mockClient);

    // Call addLight
    const error = await db.addLight(ID);

    // Check to make sure no error was returned and that redis was backed up to persistent storage
    expect(error).toBeNull();
    expect(mockClient.INCR).toHaveBeenCalled();
    expect(mockClient.INCR).toHaveBeenCalledWith(
      "lightScore",
      expect.anything()
    );
    expect(mockClient.ZADD).toHaveBeenCalled();
    expect(mockClient.ZADD).toHaveBeenCalledWith(
      "lightKeys",
      LIGHTSCORE,
      ID,
      expect.anything()
    );
    expect(mockClient.HMSET).toHaveBeenCalled();
    expect(mockClient.HMSET).toHaveBeenCalledWith(
      [
        ID,
        "name",
        ID,
        "connected",
        0,
        "state",
        "OFF",
        "brightness",
        100,
        "color:red",
        255,
        "color:green",
        0,
        "color:blue",
        0,
        "effect",
        "None",
        "speed",
        4,
        "effectsKey",
        `${ID}:effects`,
        "ipAddress",
        "",
        "macAddress",
        "",
        "numLeds",
        0,
        "udpPort",
        0,
        "version",
        "0.0.0",
        "hardware",
        "",
        "colorOrder",
        "",
        "stripType",
        ""
      ],
      expect.anything()
    );
    expect(mockClient.BGSAVE).toHaveBeenCalled();
  });
  test("correctly adds the light and returns no error (Example 2)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test B";
    const LIGHTSCORE = 8;
    mockClient.INCR = jest.fn((key, cb) => cb(null, LIGHTSCORE));
    const db = dbFactory(mockClient);

    // Call addLight
    const error = await db.addLight(ID);

    // Check to make sure no error was returned and that redis was backed up to persistent storage
    expect(error).toBeNull();
    expect(mockClient.INCR).toHaveBeenCalled();
    expect(mockClient.INCR).toHaveBeenCalledWith(
      "lightScore",
      expect.anything()
    );
    expect(mockClient.ZADD).toHaveBeenCalled();
    expect(mockClient.ZADD).toHaveBeenCalledWith(
      "lightKeys",
      LIGHTSCORE,
      ID,
      expect.anything()
    );
    expect(mockClient.HMSET).toHaveBeenCalled();
    expect(mockClient.HMSET).toHaveBeenCalledWith(
      [
        ID,
        "name",
        ID,
        "connected",
        0,
        "state",
        "OFF",
        "brightness",
        100,
        "color:red",
        255,
        "color:green",
        0,
        "color:blue",
        0,
        "effect",
        "None",
        "speed",
        4,
        "effectsKey",
        `${ID}:effects`,
        "ipAddress",
        "",
        "macAddress",
        "",
        "numLeds",
        0,
        "udpPort",
        0,
        "version",
        "0.0.0",
        "hardware",
        "",
        "colorOrder",
        "",
        "stripType",
        ""
      ],
      expect.anything()
    );
    expect(mockClient.BGSAVE).toHaveBeenCalled();
  });
  test("returns an error if the redis client is not connected", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const ID = "Test B";
    mockClient.connected = false;
    const error = await db.addLight(ID);
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if no id was provided", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const error = await db.addLight();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if updating the light order fails (INCR)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A";
    mockClient.INCR = jest.fn((key, cb) => cb(new Error()));
    const db = dbFactory(mockClient);

    // Call setLight
    const error = await db.addLight(ID);

    // Check to make sure an error was returned
    expect(mockClient.INCR).toHaveBeenCalled();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if adding the light id throws an error (ZADD)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A";
    const LIGHTSCORE = 5;
    mockClient.INCR = jest.fn((key, cb) => cb(null, LIGHTSCORE));
    mockClient.ZADD = jest.fn((key, score, val, cb) => cb(new error()));
    const db = dbFactory(mockClient);

    // Call addLight
    const error = await db.addLight(ID);

    // Check to make sure an error was returned
    expect(mockClient.ZADD).toHaveBeenCalled();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if adding the light data throws an error (HMSET)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A";
    const LIGHTSCORE = 5;
    mockClient.INCR = jest.fn((key, cb) => cb(null, LIGHTSCORE));
    mockClient.HMSET = jest.fn((arr, cb) => cb(new Error()));
    const db = dbFactory(mockClient);

    // Call addLight
    const error = await db.addLight(ID);

    // Check to make sure an error was returned
    expect(mockClient.HMSET).toHaveBeenCalled();
    expect(error).toBeInstanceOf(Error);
  });
  test("calls INCR with the correct parameters", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A";
    const LIGHTSCORE = 9;
    mockClient.INCR = jest.fn((key, cb) => cb(null, LIGHTSCORE));
    const db = dbFactory(mockClient);

    // Call addLight
    await db.addLight(ID);

    // Check to make sure no error was returned and that redis was backed up to persistent storage
    expect(mockClient.INCR).toHaveBeenCalled();
    expect(mockClient.INCR).toHaveBeenCalledWith(
      "lightScore",
      expect.anything()
    );
  });
  test("calls ZADD with the correct parameters", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test BCD";
    const LIGHTSCORE = 45;
    mockClient.INCR = jest.fn((key, cb) => cb(null, LIGHTSCORE));
    const db = dbFactory(mockClient);

    // Call addLight
    await db.addLight(ID);

    // Check to make sure no error was returned and that redis was backed up to persistent storage
    expect(mockClient.ZADD).toHaveBeenCalled();
    expect(mockClient.ZADD).toHaveBeenCalledWith(
      "lightKeys",
      LIGHTSCORE,
      ID,
      expect.anything()
    );
  });
  test("calls HMSET with the correct parameters", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test ARQS";
    const db = dbFactory(mockClient);

    // Call addLight
    await db.addLight(ID);

    // Check to make sure no error was returned and that redis was backed up to persistent storage
    expect(mockClient.HMSET).toHaveBeenCalled();
    expect(mockClient.HMSET).toHaveBeenCalledWith(
      [
        ID,
        "name",
        ID,
        "connected",
        0,
        "state",
        "OFF",
        "brightness",
        100,
        "color:red",
        255,
        "color:green",
        0,
        "color:blue",
        0,
        "effect",
        "None",
        "speed",
        4,
        "effectsKey",
        `${ID}:effects`,
        "ipAddress",
        "",
        "macAddress",
        "",
        "numLeds",
        0,
        "udpPort",
        0,
        "version",
        "0.0.0",
        "hardware",
        "",
        "colorOrder",
        "",
        "stripType",
        ""
      ],
      expect.anything()
    );
  });
});

describe("removeLight", () => {
  test("correctly removes the light and returns no error (Example 1)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test A";
    const db = dbFactory(mockClient);

    // Call removeLight
    const error = await db.removeLight(ID);

    // Check to make sure no error was returned and that redis was backed up to persistent storage
    expect(error).toBeNull();
    expect(mockClient.ZREM).toHaveBeenCalled();
    expect(mockClient.ZREM).toHaveBeenCalledWith(
      "lightKeys",
      ID,
      expect.anything()
    );
    expect(mockClient.DEL).toHaveBeenCalledTimes(2);
    expect(mockClient.DEL).toHaveBeenCalledWith(
      `${ID}:effects`,
      expect.anything()
    );
    expect(mockClient.DEL).toHaveBeenCalledWith(ID, expect.anything());
    expect(mockClient.BGSAVE).toHaveBeenCalled();
  });
  test("correctly removes the light and returns no error (Example 2)", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test 123";
    const db = dbFactory(mockClient);

    // Call removeLight
    const error = await db.removeLight(ID);

    // Check to make sure no error was returned and that redis was backed up to persistent storage
    expect(error).toBeNull();
    expect(mockClient.ZREM).toHaveBeenCalled();
    expect(mockClient.ZREM).toHaveBeenCalledWith(
      "lightKeys",
      ID,
      expect.anything()
    );
    expect(mockClient.DEL).toHaveBeenCalledTimes(2);
    expect(mockClient.DEL).toHaveBeenCalledWith(
      `${ID}:effects`,
      expect.anything()
    );
    expect(mockClient.DEL).toHaveBeenCalledWith(ID, expect.anything());
    expect(mockClient.BGSAVE).toHaveBeenCalled();
  });
  test("returns an error if the redis client is not connected", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const ID = "Test B";
    mockClient.connected = false;
    const error = await db.removeLight(ID);
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if no id was provided", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const error = await db.removeLight();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if removing the light id throws an error (ZREM)", async () => {
    let mockClient = createMockClient();
    mockClient.ZREM = jest.fn((key, val, cb) => cb(new Error()));
    const db = dbFactory(mockClient);
    const ID = "Test B";
    const error = await db.removeLight(ID);
    expect(mockClient.ZREM).toBeCalled();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if removing the light data or key throws an error (DEL)", async () => {
    let mockClient = createMockClient();
    mockClient.DEL = jest.fn((key, cb) => cb(new Error()));
    const db = dbFactory(mockClient);
    const ID = "Test B";
    const error = await db.removeLight(ID);
    expect(mockClient.DEL).toBeCalled();
    expect(error).toBeInstanceOf(Error);
  });
  test("calls ZREM with the correct parameters", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test 123";
    const db = dbFactory(mockClient);

    // Call removeLight
    await db.removeLight(ID);

    expect(mockClient.ZREM).toHaveBeenCalled();
    expect(mockClient.ZREM).toHaveBeenCalledWith(
      "lightKeys",
      ID,
      expect.anything()
    );
  });
  test("calls DEL twice with the correct parameters", async () => {
    // Create mocks and db
    let mockClient = createMockClient();
    const ID = "Test 123";
    const db = dbFactory(mockClient);

    // Call removeLight
    await db.removeLight(ID);

    expect(mockClient.DEL).toHaveBeenCalledTimes(2);
    expect(mockClient.DEL).toHaveBeenCalledWith(
      `${ID}:effects`,
      expect.anything()
    );
    expect(mockClient.DEL).toHaveBeenCalledWith(ID, expect.anything());
  });
});

describe("hasLight", () => {
  test("returns true if the light id is in the database", async () => {
    let mockClient = createMockClient();
    const ID = "Test B";
    const LIGHTSCORE = 9;
    mockClient.ZSCORE = jest.fn((key, val, cb) => cb(null, LIGHTSCORE));
    const db = dbFactory(mockClient);
    const { error, hasLight } = await db.hasLight(ID);
    expect(error).toBeNull();
    expect(hasLight).toBe(true);
  });
  test("returns false if the light id is not in the database", async () => {
    let mockClient = createMockClient();
    const ID = "Test B";
    mockClient.ZSCORE = jest.fn((key, val, cb) => cb(null, null));
    const db = dbFactory(mockClient);
    const { error, hasLight } = await db.hasLight(ID);
    expect(error).toBeNull();
    expect(hasLight).toBe(false);
  });
  test("returns an error if the redis client is not connected", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const ID = "Test B";
    mockClient.connected = false;
    const { error } = await db.hasLight(ID);
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if no id was provided", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    const { error } = await db.hasLight();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if getting the light id throws an error (ZSCORE)", async () => {
    let mockClient = createMockClient();
    const ID = "Test B";
    mockClient.ZSCORE = jest.fn((key, val, cb) => cb(new Error()));
    const db = dbFactory(mockClient);
    const { error } = await db.hasLight(ID);
    expect(error).toBeInstanceOf(Error);
  });
  test("calls ZSCORE with the correct parameters", async () => {});
});
