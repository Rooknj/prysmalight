const dbFactory = require("./dbFactory");
const { isObservable } = require("rxjs");

const mockClient = {
  on: () => {},
  SMEMBERS: () => {},
  SADD: () => {},
  INCR: () => {},
  ZADD: () => {},
  ZREM: () => {},
  ZSCORE: () => {},
  ZRANGE: () => {},
  HMSET: () => {},
  DEL: () => {},
  HGETALL: () => {},
  connected: true
};

describe("connections", () => {
  test("is defined", () => {
    const db = dbFactory(mockClient);
    expect(db.connections).toBeDefined();
  });

  test("is an observable", () => {
    const db = dbFactory(mockClient);
    expect(isObservable(db.connections)).toBe(true);
  });
});

describe("disconnections", () => {
  test("is defined", () => {
    const db = dbFactory(mockClient);
    expect(db.disconnections).toBeDefined();
  });

  test("is an observable", () => {
    const db = dbFactory(mockClient);
    expect(isObservable(db.disconnections)).toBe(true);
  });
});

describe("getLight", () => {
  test("returns an error if the redis client is not connected", () => {});
  test("returns an error if it fails to get the Effect List (SMEMBERS)", () => {});
  test("returns an error if it fails to get the light data (HGETALL)", () => {});
  test("returns a javascript object in the correct format", () => {});
  test("returns the correct state", () => {});
  test("returns the correct brightness", () => {});
  test("returns the correct effect", () => {});
  test("returns the correct speed", () => {});
  test("returns the correct color", () => {});
  test("returns the correct effect list in the correct order", () => {});
});

describe("getAllLights", () => {
  test("returns an error if the redis client is not connected", () => {});
  test("returns an error if one of the lights was not able to be fetched", () => {});
  test("returns an empty array there are no lights in the database", () => {});
  test("returns an array containing all lights in the database", () => {});
});

describe("setLight", () => {
  test("returns an error if the redis client is not connected", () => {});
  test("returns an error if no id is provided", () => {});
  test("returns an error if it fails to set the Effect List (SADD)", () => {});
  test("returns an error if it fails to set the light data (HMSET)", () => {});
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
  test("returns the id of the removed light", () => {});
});

describe("hasLight", () => {
  test("returns an error if the redis client is not connected", () => {});
  test("returns an error if getting the light id throws an error (ZSCORE)", () => {});
  test("returns true ig the light id is in the database", () => {});
  test("returns true ig the light id is not in the database", () => {});
});
