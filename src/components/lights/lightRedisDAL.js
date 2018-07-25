import redis from "redis";
import { promisify } from "util";
import Debug from "debug";

const debug = Debug("redisDAL");

let REDIS_HOST = "localhost";
if (process.env.IN_DOCKER_CONTAINER) {
  debug("Find redis inside docker container");
  REDIS_HOST = "redis";
}
const REDIS_PORT = 6379;
const client = redis.createClient(REDIS_PORT, REDIS_HOST);
const asyncSMEMBERS = promisify(client.SMEMBERS).bind(client);
const asyncSADD = promisify(client.SADD).bind(client);
//const asyncSREM = promisify(client.SREM).bind(client);
const asyncINCR = promisify(client.INCR).bind(client);
const asyncZADD = promisify(client.ZADD).bind(client);
const asyncZREM = promisify(client.ZREM).bind(client);
const asyncZRANGE = promisify(client.ZRANGE).bind(client);
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
      debug("Connected to redis");
    });
    client.on("ready", () => {
      debug("redis is ready");
    });
    client.on("reconnecting", () => {
      debug("Attempting to reconnect to redis");
    });
    client.on("error", () => {
      debug("redis encountered an error");
    });
    client.on("end", () => {
      debug("redis connection was closed");
    });
  }

  async getAllLights() {
    // Get all the light keys from redis
    const lightKeys = await asyncZRANGE("lightKeys", 0, -1);

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
    const lightDataResponse = await asyncHGETALL(id);
    const lightEffectResponse = await asyncSMEMBERS(
      lightDataResponse.effectsKey
    );

    // Convert that info into a javascript object
    const lightObject = mapRedisObjectToLightObject(
      id,
      lightDataResponse,
      lightEffectResponse
    );
    return lightObject;
  }

  // TODO: Make this function set specific fields on the light and not modify the others
  async setLight(id, lightData) {
    if (!id) {
      debug("No ID supplied to setLight()");
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
    let addEffectsPromise = Promise.resolve();
    if (lightData.hasOwnProperty("supportedEffects")) {
      redisObject.push("effectsKey", `${id}:effects`);
      addEffectsPromise = asyncSADD(
        `${id}:effects`,
        lightData.supportedEffects
      );
    }

    const addLightDataPromise = await asyncHMSET(redisObject);
    // Wait until all data is saved
    await Promise.all([addLightDataPromise, addEffectsPromise]);
    return this.getLight(id);
  }

  async addLight(id) {
    const score = await asyncINCR("lightScore");
    const response = await asyncZADD("lightKeys", score, id);

    let response2;
    switch (response) {
      // If the response is 1, then adding the light was successful
      // If 0, it was unsuccessful
      case 1:
        debug("successfully added key");
        response2 = await asyncHMSET(getNewRedisLight(id));
        break;
      default:
        // TODO: Throw error
        debug("Error adding key");
        return;
    }

    switch (response2) {
      case "OK":
        debug("Light successfully added");
        // Save the redis database to persistant storave
        client.BGSAVE();
        // Return the newly added light
        return this.getLight(id);
      default:
        //TODO: throw error
        debug("Error adding light");
        return;
    }

    // If the response is OK, then setting the light was successful
  }

  async removeLight(id) {
    const response = await asyncZREM("lightKeys", id);

    let response2;
    switch (response) {
      // If the response is 1, then deleting the lightKey was successful
      // If 0, it was unsuccessful
      case 1:
        debug("successfully deleted key");
        response2 = await asyncDEL(id);
        break;
      default:
        // TODO: Throw error
        debug("Error deleting key");
        return;
    }

    // If the response is 1, then deleting the light was successful
    switch (response2) {
      case 1:
        debug("Light successfully deleted");
        // Save the redis database to persistant storave
        client.BGSAVE();
        // Return the id of the deleted light
        return { id };
      default:
        //TODO: throw error
        debug("Error deleting light");
        return;
    }
  }

  // TODO: Implement
  async hasLight(id) {
    debug(id);
    return true;
  }
}

export default Light;
