import redis from "redis";
import { promisify } from "util";

const client = redis.createClient();
const asyncSMEMBERS = promisify(client.SMEMBERS).bind(client);
const asyncSADD = promisify(client.SADD).bind(client);
const asyncSREM = promisify(client.SREM).bind(client);
const asyncHMSET = promisify(client.HMSET).bind(client);
const asyncDEL = promisify(client.DEL).bind(client);
const asyncHGETALL = promisify(client.HGETALL).bind(client);

// Function to return a new light object with default values
const getNewRedisLight = id => [
  id,
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
  `${id}:effects`
];

const mapRedisObjectToLightObject = (id, redisResponse, supportedEffects) => ({
  id,
  connected: redisResponse.connected,
  state: redisResponse.state,
  brightness: parseInt(redisResponse.brightness),
  color: {
    r: parseInt(redisResponse["color:red"]),
    g: parseInt(redisResponse["color:green"]),
    b: parseInt(redisResponse["color:blue"])
  },
  effect: redisResponse.effect,
  speed: parseInt(redisResponse.speed),
  supportedEffects
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

  async getAllLights() {
    // Get all the light keys from redis
    const lightKeys = await asyncSMEMBERS("lightKeys");

    // For each light key, get the corresponding light data
    const mapLightPromises = lightKeys.map(async lightKey =>
      this.getLight(lightKey)
    );

    // Wait for all of the promises returned by this.getLight to resolve
    const returnVal = await Promise.all(mapLightPromises);
    return returnVal;
  }

  async getLight(id) {
    // Get all info about the light
    const response = await asyncHGETALL(id);

    // Convert that info into a javascript object
    const lightObject = mapRedisObjectToLightObject(id, response, ["Hello"]);
    return lightObject;
  }

  // TODO: Make this function set specific fields on the light and not modify the others
  async setLight(id, lightData) {
    if (!id) {
      console.error("No ID supplied");
      return;
    }
    let redisObject = [id];
    if (lightData.hasOwnProperty("connected"))
      redisObject.push("connected", lightData.connected);
    if (lightData.hasOwnProperty("state"))
      redisObject.push("state", lightData.state);
    if (lightData.hasOwnProperty("brightness"))
      redisObject.push("brightness", lightData.brightness);
    if (lightData.hasOwnProperty("effect"))
      redisObject.push("effect", lightData.effect);
    if (lightData.hasOwnProperty("speed"))
      redisObject.push("speed", lightData.speed);
    if (lightData.hasOwnProperty("color")) {
      redisObject.push("color:red", lightData.color.r);
      redisObject.push("color:green", lightData.color.g);
      redisObject.push("color:blue", lightData.color.b);
    }
    if (lightData.hasOwnProperty("supportedEffects")) {
      redisObject.push("effectsKey", `${id}:effects`);
    }

    console.log(redisObject);
    const response = await asyncHMSET(redisObject);
    console.log("Set light:", response);
    return this.getLight(id);
  }

  async addLight(id) {
    const response = await asyncSADD("lightKeys", id);

    let response2;
    switch (response) {
      // If the response is 1, then adding the light was successful
      // If 0, it was unsuccessful
      case 1:
        console.log("successfully added key");
        response2 = await asyncHMSET(getNewRedisLight(id));
        break;
      default:
        // TODO: Throw error
        console.log("Error adding key");
        return;
    }

    switch (response2) {
      case "OK":
        console.log("Light successfully added");
        return this.getLight(id);
      default:
        //TODO: throw error
        console.log("Error adding light");
        return;
    }

    // If the response is OK, then setting the light was successful
  }

  async removeLight(id) {
    const response = await asyncSREM("lightKeys", id);

    let response2;
    switch (response) {
      // If the response is 1, then deleting the lightKey was successful
      // If 0, it was unsuccessful
      case 1:
        console.log("successfully deleted key");
        response2 = await asyncDEL(id);
        break;
      default:
        // TODO: Throw error
        console.log("Error deleting key");
        return;
    }

    // If the response is 1, then deleting the light was successful
    switch (response2) {
      case 1:
        console.log("Light successfully deleted");
        return id;
      default:
        //TODO: throw error
        console.log("Error deleting light");
        return;
    }
  }

  async hasLight(id) {
    return true;
  }
}

export default Light;
