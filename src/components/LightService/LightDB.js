import redis from "redis";
import { promisify } from "util";
import {
  getRedisHost,
  getNewRedisLight,
  mapRedisObjectToLightObject
} from "./lightUtil";

import Debug from "debug";

const debug = Debug("LightDB");

const REDIS_HOST = getRedisHost();
const REDIS_PORT = 6379;

class LightDB {
  constructor() {
    this.isConnected = false;

    // Default connection handlers
    this.defaultConnectHandler = () => {
      debug("Connected to redis");
      this.isConnected = true;
    };
    this.defaultDisconnectHandler = () => {
      debug("redis connection was closed");
      this.isConnected = false;
    };

    this.client = redis.createClient(REDIS_PORT, REDIS_HOST);

    // Promisify all redis client methods
    this.client.asyncSMEMBERS = promisify(this.client.SMEMBERS).bind(
      this.client
    );
    this.client.asyncSADD = promisify(this.client.SADD).bind(this.client);
    this.client.asyncINCR = promisify(this.client.INCR).bind(this.client);
    this.client.asyncZADD = promisify(this.client.ZADD).bind(this.client);
    this.client.asyncZREM = promisify(this.client.ZREM).bind(this.client);
    this.client.asyncZSCORE = promisify(this.client.ZSCORE).bind(this.client);
    this.client.asyncZRANGE = promisify(this.client.ZRANGE).bind(this.client);
    this.client.asyncHMSET = promisify(this.client.HMSET).bind(this.client);
    this.client.asyncDEL = promisify(this.client.DEL).bind(this.client);
    this.client.asyncHGETALL = promisify(this.client.HGETALL).bind(this.client);

    this.initDBWatchers();
  }

  initDBWatchers() {
    this.client.on("connect", this.defaultConnectHandler);
    this.client.on("end", this.defaultDisconnectHandler);
    this.client.on("ready", () => {
      debug("redis is ready");
    });
    // TODO: Add logging on errors here
    this.client.on("error", () => {});
  }

  onConnect(handler) {
    this.client.on("connect", handler);
  }

  onDisconnect(handler) {
    this.client.on("end", handler);
  }

  async getAllLights() {
    if (!this.isConnected) {
      return {
        error: new Error("Can not get lights. Not connected to Redis")
      };
    }

    // Get all the light keys from redis
    let lightKeys;
    try {
      lightKeys = await this.client.asyncZRANGE("lightKeys", 0, -1);
    } catch (error) {
      return { error };
    }

    // For each light key, get the corresponding light data
    const mapLightPromises = lightKeys.map(async lightKey =>
      this.getLight(lightKey)
    );

    // Wait for all of the promises returned by this.getLight to resolve
    const lightsArray = await Promise.all(mapLightPromises);

    // Get the data out of our responses
    let returnObject = { error: null, lights: null };
    const lights = lightsArray.map(({ error, light }) => {
      // If a failure already occured, skip any additional logic here
      if (returnObject.error) return;
      // If a failure occured in any of the getLight operations, set the failure and error fields in returnObject
      if (error) {
        returnObject.error = error;
        return;
      }
      // If everything went well, just return the data
      return light;
    });
    if (!returnObject.error) {
      returnObject.lights = lights;
    }
    return returnObject;
  }

  async getLight(id) {
    if (!this.isConnected) {
      return {
        error: new Error(`Can not get "${id}". Not connected to Redis`)
      };
    }

    let lightData, lightEffect;
    // Get data about the light
    try {
      lightData = await this.client.asyncHGETALL(id);
    } catch (error) {
      return { error };
    }

    // Get the light's effects
    try {
      lightEffect = await this.client.asyncSMEMBERS(lightData.effectsKey);
    } catch (error) {
      return { error };
    }

    // Convert that info into a javascript object
    const lightObject = mapRedisObjectToLightObject(id, lightData, lightEffect);
    return { light: lightObject };
  }

  async setLight(id, lightData) {
    if (!this.isConnected) {
      return {
        error: new Error(`Can not set "${id}". Not connected to Redis`)
      };
    }

    // You need an id to set the light
    if (!id) {
      return { error: new Error("No ID supplied to setLight()") };
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
      addEffectsPromise = this.client.asyncSADD(
        `${id}:effects`,
        lightData.supportedEffects
      );
    }

    // Push data object to redis database
    const addLightDataPromise = this.client.asyncHMSET(redisObject);

    // Wait until all data is saved
    try {
      await Promise.all([addLightDataPromise, addEffectsPromise]);
    } catch (error) {
      return { error };
    }

    return this.getLight(id);
  }

  async addLight(id) {
    if (!this.isConnected) {
      return {
        error: new Error(`Can not add "${id}". Not connected to Redis`)
      };
    }

    let lightScore, addLightKeyResponse, addLightDataResponse;

    try {
      lightScore = await this.client.asyncINCR("lightScore");
    } catch (error) {
      return { error };
    }

    try {
      addLightKeyResponse = await this.client.asyncZADD(
        "lightKeys",
        lightScore,
        id
      );
    } catch (error) {
      return { error };
    }

    switch (addLightKeyResponse) {
      // If the response is 1, then adding the light was successful
      // If 0, it was unsuccessful
      case 1:
        debug("successfully added key");
        try {
          addLightDataResponse = await this.client.asyncHMSET(
            getNewRedisLight(id)
          );
        } catch (error) {
          return { error };
        }
        break;
      default:
        return {
          error: new Error(
            "Could not add light key to redis. returned with response code != 1"
          )
        };
    }

    switch (addLightDataResponse) {
      // If the response is OK, then setting the light was successful
      case "OK":
        debug("Light successfully added");
        // Save the redis database to persistant storage
        this.client.BGSAVE();
        // Return the newly added light
        return this.getLight(id);
      default:
        return {
          error: new Error(
            'Could not add light key to redis. returned with response code != "OK"'
          )
        };
    }
  }

  async removeLight(id) {
    if (!this.isConnected) {
      return {
        error: new Error(`Can't remove "${id}". Not connected to redis`)
      };
    }

    let removeKeyResponse, deleteLightResponse;
    try {
      removeKeyResponse = await this.client.asyncZREM("lightKeys", id);
    } catch (error) {
      return { error };
    }

    switch (removeKeyResponse) {
      // If the response is 1, then deleting the lightKey was successful
      // If 0, it was unsuccessful
      case 1:
        debug("successfully deleted key");
        try {
          deleteLightResponse = await this.client.asyncDEL(id);
        } catch (error) {
          return { error };
        }
        break;
      default:
        return {
          error: new Error(
            "Could not remove light key from Redis. Response code != 1"
          )
        };
    }

    // If the response is 1, then deleting the light was successful
    switch (deleteLightResponse) {
      case 1:
        debug("Light successfully deleted");
        // Save the redis database to persistant storave
        this.client.BGSAVE();
        // Return the id of the deleted light
        return { lightRemoved: { id } };
      default:
        return {
          error: new Error(
            "Could not remove light key from Redis. Response code != 1"
          )
        };
    }
  }

  async hasLight(id) {
    if (!this.isConnected) {
      return {
        error: new Error(
          `Can not check if "${id}" was added. Not connected to Redis`
        )
      };
    }

    let lightScore;
    // May throw an error
    lightScore = await this.client.asyncZSCORE("lightKeys", id);

    // If the light has a score, it exists.
    if (lightScore) {
      return {
        hasLight: true
      };
    } else {
      return {
        hasLight: false
      };
    }
  }
}

export default LightDB;
