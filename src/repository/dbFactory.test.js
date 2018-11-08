const dbFactory = require("./dbFactory");
const { isObservable } = require("rxjs");

const createMockClient = () => {
  const err = null;
  const result = null;
  // Each function models the arguments taken by the actual Redis Client functions
  // cb is the callback function which is necessary for dbFactory's promisify code to work.
  return {
    on: jest.fn(() => {}),
    SMEMBERS: jest.fn((key, cb) => cb(err, result)),
    SADD: jest.fn((key, val, cb) => cb(err, result)),
    INCR: jest.fn((key, cb) => cb(err, result)),
    ZADD: jest.fn((key, score, val, cb) => cb(err, result)),
    ZREM: jest.fn((key, val, cb) => cb(err, result)),
    ZSCORE: jest.fn((key, val, cb) => cb(err, result)),
    ZRANGE: jest.fn((key, low, high, cb) => cb(err, result)),
    HMSET: jest.fn((arr, cb) => cb(err, result)),
    DEL: jest.fn((key, cb) => cb(err, result)),
    HGETALL: jest.fn((key, cb) => cb(err, result)),
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

describe("getLight", () => {
  test("returns an error if the redis client is not connected", async () => {
    let mockClient = createMockClient();
    const db = dbFactory(mockClient);
    mockClient.connected = false;
    const { error } = await db.getLight("Test Disconnected");
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to get the Effect List (SMEMBERS)", async () => {
    let mockClient = createMockClient();
    const EFFECTSKEY = "Test: effects";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        effectsKey: EFFECTSKEY
      })
    );
    mockClient.SMEMBERS = jest.fn((_, cb) => cb(new Error("Test Error")));
    const db = dbFactory(mockClient);
    const { error } = await db.getLight("Test A");
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Error);
  });
  test("returns an error if it fails to get the light data (HGETALL)", async () => {
    let mockClient = createMockClient();
    mockClient.HGETALL = jest.fn((_, cb) => cb(new Error("Test Error")));
    const db = dbFactory(mockClient);
    const { error } = await db.getLight("Test A");
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Error);
  });
  test("calls SMEMBERS with the correct parameters", async () => {
    let mockClient = createMockClient();
    const EFFECTSKEY = "Test: effects";
    mockClient.HGETALL = jest.fn((_, cb) =>
      cb(null, {
        effectsKey: EFFECTSKEY
      })
    );
    const db = dbFactory(mockClient);
    await db.getLight("Test A");
    expect(mockClient.SMEMBERS).toHaveBeenCalled();
    expect(mockClient.SMEMBERS).toHaveBeenCalledWith(
      EFFECTSKEY,
      expect.anything()
    );
  });
  test("calls HGETALL with the correct parameters", async () => {
    let mockClient = createMockClient();
    const ID = "Test A";
    const db = dbFactory(mockClient);
    await db.getLight(ID);
    expect(mockClient.HGETALL).toHaveBeenCalled();
    expect(mockClient.HGETALL).toHaveBeenCalledWith(ID, expect.anything());
  });
  test("returns a javascript object in the correct format", async () => {
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
    const { error, light } = await db.getLight(ID);
    expect(error).toBeUndefined();
    expect(light).toBeDefined();
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
    expect(error).toBeUndefined();
    expect(light).toBeDefined();
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
    expect(error).toBeUndefined();
    expect(light).toBeDefined();
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
    expect(error).toBeUndefined();
    expect(light).toBeDefined();
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
    expect(error).toBeUndefined();
    expect(light).toBeDefined();
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
    expect(error).toBeUndefined();
    expect(light).toBeDefined();
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
    expect(error).toBeUndefined();
    expect(light).toBeDefined();
    expect(light.supportedEffects).toEqual(EFFECTSLIST);
  });
});

describe("getAllLights", () => {
  test("returns an error if the redis client is not connected", () => {});
  test("returns an error if one of the lights was not able to be fetched", () => {});
  test("returns an empty array there are no lights in the database", () => {});
  test("returns an array containing all lights in the database", () => {});
  test("calls ZRANGE with the correct parameters", () => {});
  test("returns an error if it fails to get the light keys (ZRANGE)", () => {});
});

describe("setLight", () => {
  test("returns an error if the redis client is not connected", () => {});
  test("returns an error if no id is provided", () => {});
  test("returns an error if it fails to set the Effect List (SADD)", () => {});
  test("returns an error if it fails to set the light data (HMSET)", () => {});
  test("calls SADD with the correct parameters", () => {});
  test("calls HMSET with the correct parameters", () => {});
  test("correctly sets the light connection status", () => {});
  test("correctly sets the light state", () => {});
  test("correctly sets the light brightness", () => {});
  test("correctly sets the light effect", () => {});
  test("correctly sets the light speed", () => {});
  test("correctly sets the light color", () => {});
  test("correctly sets the light effect list in the correct order", () => {});
  test("does not change data that isn't provided", () => {});
});

describe("addLight", () => {
  test("returns an error if the redis client is not connected", () => {});
  test("returns an error if updating the light order throws an error (INCR)", () => {});
  test("returns an error if the light id was already added", () => {});
  test("returns an error if adding the light id throws an error (ZADD)", () => {});
  test("returns an error if adding the light id was unsuccessful (ZADD)", () => {});
  test("adds the light data if adding the light id was successful (ZADD)", () => {});
  test("returns an error if adding the light data throws an error (HMSET)", () => {});
  test("saves the redis data to persistant storage if adding the light data was successful (HMSET)", () => {});
  test("returns an error if adding the light data was unsuccessful (HMSET)", () => {});
  test("calls INCR with the correct parameters", () => {});
  test("calls ZADD with the correct parameters", () => {});
  test("calls HMSET with the correct parameters", () => {});
  test("returns the newly added light", () => {});
});

describe("removeLight", () => {
  test("returns an error if the redis client is not connected", () => {});
  test("returns successfully if the light id was already removed or not present", () => {});
  test("returns an error if removing the light id throws an error (ZREM)", () => {});
  test("returns an error if removing the light id was unsuccessful (ZREM)", () => {});
  test("removes the light data if removing the light id was successful (ZREM)", () => {});
  test("returns an error if removing the light data throws an error (DEL)", () => {});
  test("saves the redis data to persistant storage if removing the light data was successful (DEL)", () => {});
  test("returns an error if removing the light data was unsuccessful (DEL)", () => {});
  test("calls ZREM with the correct parameters", () => {});
  test("calls DEL with the correct parameters", () => {});
  test("returns the id of the removed light", () => {});
});

describe("hasLight", () => {
  test("returns an error if the redis client is not connected", () => {});
  test("returns an error if getting the light id throws an error (ZSCORE)", () => {});
  test("returns true ig the light id is in the database", () => {});
  test("returns true ig the light id is not in the database", () => {});
  test("calls ZSCORE with the correct parameters", () => {});
});
