import redis from "redis";
import { promisify } from "util";

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);

// Function to return a new light object with default values
const getNewLight = id => ({
  id,
  connected: 0,
  state: "OFF",
  brightness: 100,
  color: { r: 255, g: 0, b: 0 },
  effect: "None",
  speed: 4,
  supportedEffects: []
});

class Light {
  constructor() {
    client.on("connect", () => {
      console.log("Connected to redis");
    });
    client.on("ready", () => {
      console.log("redis is ready");
    });
    client.on("reconnecting", () => {
      console.log("Attempting to reconnect to redis");
    });
    client.on("error", () => {
      console.log("redis encountered an error");
    });
    client.on("end", () => {
      console.log("redis connection was closed");
    });
  }

  getAllLights() {
    client.SMEMBERS("lights", (err, obj) => {
      console.log("GetLights", err, obj);
    });
  }

  getLight(id) {
    client.HGET(id, (err, obj) => {
      console.log("getLight", err, obj);
    });
  }

  setLight(light) {
    const { id, ...properties } = light;
    client.HMSET(id, properties, (err, obj) => {
      console.log("setLight", err, obj);
    });
  }

  addLight(id) {
    client.SADD("lights", id, (err, obj) => {
      console.log("addLight", err, obj);
    });
  }

  removeLight(id) {
    client.SREM("lights", id, (err, obj) => {
      console.log("removeLight", err, obj);
    });
  }
}

export default Light;
