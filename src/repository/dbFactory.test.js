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
  HGETALL: () => {}
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
  test("TODO", () => {});
});

describe("getAllLights", () => {
  test("TODO", () => {});
});

describe("setLight", () => {
  test("TODO", () => {});
});

describe("addLight", () => {
  test("TODO", () => {});
});

describe("removeLight", () => {
  test("TODO", () => {});
});

describe("hasLight", () => {
  test("TODO", () => {});
});
