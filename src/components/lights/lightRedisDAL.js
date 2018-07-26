import redis from "redis";
import { promisify } from "util";
import Debug from "debug";

const debug = Debug("redisDAL");

// The maximum amount of time to wait until a request fails due to not having a connection
const TIMEOUT_WAIT = 3000;
const asyncSetTimeout = promisify(setTimeout);

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
    this.isConnected = false;
    client.on("connect", () => {
      debug("Connected to redis");
      this.isConnected = true;
    });
    client.on("ready", () => {
      debug("redis is ready");
    });
    client.on("reconnecting", () => {
      //debug("Attempting to reconnect to redis");
      this.isConnected = false;
    });
    client.on("error", () => {
      // TODO: Figure out which error signifies losing connection
      //debug("redis encountered an error");
    });
    client.on("end", () => {
      debug("redis connection was closed");
    });
  }

  async getAllLights() {
    if (!this.isConnected) {
      await asyncSetTimeout(TIMEOUT_WAIT);
      if (!this.isConnected) {
        throw new Error("Can not get lights. Not connected to Redis");
      }
    }

    // Get all the light keys from redis
    let lightKeys, lightsArray;
    try {
      lightKeys = await asyncZRANGE("lightKeys", 0, -1);
    } catch (error) {
      debug("Error getting light keys from redis");
      return error;
    }

    // For each light key, get the corresponding light data
    const mapLightPromises = lightKeys.map(async lightKey =>
      this.getLight(lightKey)
    );

    // Wait for all of the promises returned by this.getLight to resolve
    try {
      lightsArray = await Promise.all(mapLightPromises);
    } catch (error) {
      debug("Error getting one of the lights from redis");
      return error;
    }

    return lightsArray;
  }

  async getLight(id) {
    if (!this.isConnected) {
      await asyncSetTimeout(TIMEOUT_WAIT);
      if (!this.isConnected) {
        throw new Error(`Can not get "${id}". Not connected to Redis`);
      }
    }
    let lightData, lightEffect;

    // Get data about the light
    try {
      lightData = await asyncHGETALL(id);
    } catch (error) {
      debug(`Error getting light: ${id}`);
      return error;
    }

    // Get the light's effects
    try {
      lightEffect = await asyncSMEMBERS(lightData.effectsKey);
    } catch (error) {
      debug(`Error getting effects for light: ${id}`);
      return error;
    }

    // Convert that info into a javascript object
    const lightObject = mapRedisObjectToLightObject(id, lightData, lightEffect);
    return lightObject;
  }

  async setLight(id, lightData) {
    // You need an id to set the light
    if (!id) {
      debug("No ID supplied to setLight()");
      return new Error("No ID supplied to setLight()");
    }
    // Populate the redis object with the id of the light as a key
    let redisObject = [id];
    // Add the connected data
    if (lightData.hasOwnProperty("connected"))
      redisObject.push("connected", lightData.connected);
    // Add the connected data
    if (lightData.hasOwnProperty("state"))
      redisObject.push("state", lightData.state);
    // Add the brightness data
    if (lightData.hasOwnProperty("brightness"))
      redisObject.push("brightness", lightData.brightness);
    // Add the current effect data
    if (lightData.hasOwnProperty("effect"))
      redisObject.push("effect", lightData.effect);
    // Add the effect speed data
    if (lightData.hasOwnProperty("speed"))
      redisObject.push("speed", lightData.speed);
    // Add the color data
    if (lightData.hasOwnProperty("color")) {
      redisObject.push("color:red", lightData.color.r);
      redisObject.push("color:green", lightData.color.g);
      redisObject.push("color:blue", lightData.color.b);
    }
    // Add the effect list data
    let addEffectsPromise = Promise.resolve();
    if (lightData.hasOwnProperty("supportedEffects")) {
      redisObject.push("effectsKey", `${id}:effects`);
      addEffectsPromise = asyncSADD(
        `${id}:effects`,
        lightData.supportedEffects
      );
    }

    // Push data object to redis database
    const addLightDataPromise = asyncHMSET(redisObject);

    // Wait until all data is saved
    try {
      await Promise.all([addLightDataPromise, addEffectsPromise]);
    } catch (error) {
      debug("Error setting the light to redis database");
      return error;
    }
    return this.getLight(id);
  }

  async addLight(id) {
    if (!this.isConnected) {
      await asyncSetTimeout(TIMEOUT_WAIT);
      if (!this.isConnected) {
        throw new Error(`Can not add "${id}". Not connected to Redis`);
      }
    }
    let lightScore, addLightKeyResponse, addLightDataResponse;

    try {
      lightScore = await asyncINCR("lightScore");
    } catch (error) {
      debug("Error incrementing lightScore in redis");
      return error;
    }

    try {
      addLightKeyResponse = await asyncZADD("lightKeys", lightScore, id);
    } catch (error) {
      debug("Error adding light key to redis");
      return error;
    }

    switch (addLightKeyResponse) {
      // If the response is 1, then adding the light was successful
      // If 0, it was unsuccessful
      case 1:
        debug("successfully added key");
        try {
          addLightDataResponse = await asyncHMSET(getNewRedisLight(id));
        } catch (error) {
          debug("Error adding light to redis");
          return error;
        }
        break;
      default:
        debug(
          "Could not add light key to redis. returned with response code != 1"
        );
        return new Error(
          "Could not add light key to redis. returned with response code != 1"
        );
    }

    switch (addLightDataResponse) {
      // If the response is OK, then setting the light was successful
      case "OK":
        debug("Light successfully added");
        // Save the redis database to persistant storave
        client.BGSAVE();
        // Return the newly added light
        return this.getLight(id);
      default:
        debug(
          'Could not add light key to redis. returned with response code != "OK"'
        );
        return new Error(
          'Could not add light key to redis. returned with response code != "OK"'
        );
    }
  }

  async removeLight(id) {
    if (!this.isConnected) {
      await asyncSetTimeout(TIMEOUT_WAIT);
      if (!this.isConnected) {
        throw new Error(`Can't remove "${id}". Not connected to redis`);
      }
    }
    let removeKeyResponse, deleteLightResponse;

    try {
      removeKeyResponse = await asyncZREM("lightKeys", id);
    } catch (error) {
      debug("Error removing key from redis");
      return error;
    }

    switch (removeKeyResponse) {
      // If the response is 1, then deleting the lightKey was successful
      // If 0, it was unsuccessful
      case 1:
        debug("successfully deleted key");
        try {
          deleteLightResponse = await asyncDEL(id);
        } catch (error) {
          debug("Error removing light data from redis");
          return error;
        }
        break;
      default:
        debug("Could not remove light key from Redis. Response code != 1");
        return new Error(
          "Could not remove light key from Redis. Response code != 1"
        );
    }

    // If the response is 1, then deleting the light was successful
    switch (deleteLightResponse) {
      case 1:
        debug("Light successfully deleted");
        // Save the redis database to persistant storave
        client.BGSAVE();
        // Return the id of the deleted light
        return { id };
      default:
        debug("Could not remove light data from Redis. Response code != 1");
        return new Error(
          "Could not remove light data from Redis. Response code != 1"
        );
    }
  }

  // TODO: Implement
  async hasLight(id) {
    debug(id);
    return new Error(
      "hasLight is not implemented yet. You should be catching this error anyway"
    );
  }
}

export default Light;
