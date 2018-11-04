const { promisify } = require("util");
const Debug = require("debug").default;
const { getNewRedisLight } = require("./lightUtil");
const debug = Debug("db");
const { fromEvent } = require("rxjs");

/**
 * Factory which returns an object with all database methods
 * @param {object} client - The Redis client
 */
const dbFactory = client => {
  // TODO: Find a better way to handle errors
  client.on("error", err => debug(err));
  // TODO: Find a way safely call BGSAVE when you are making a bunch of addLight requests in rapid succession
  // { ReplyError: ERR Background save already in progress
  //   at parseError (/snapshot/app/node_modules/redis-parser/lib/parser.js:193:12)
  //   at parseType (/snapshot/app/node_modules/redis-parser/lib/parser.js:303:14) command: 'BGSAVE', code: 'ERR' }

  // Promisify all client methods
  const asyncSMEMBERS = promisify(client.SMEMBERS).bind(client),
    asyncSADD = promisify(client.SADD).bind(client),
    asyncINCR = promisify(client.INCR).bind(client),
    asyncZADD = promisify(client.ZADD).bind(client),
    asyncZREM = promisify(client.ZREM).bind(client),
    asyncZSCORE = promisify(client.ZSCORE).bind(client),
    asyncZRANGE = promisify(client.ZRANGE).bind(client),
    asyncHMSET = promisify(client.HMSET).bind(client),
    asyncDEL = promisify(client.DEL).bind(client),
    asyncHGETALL = promisify(client.HGETALL).bind(client);

  /**
   * An observable of all the times the client connects
   */
  const connections = fromEvent(client, "connect");

  /**
   * An observable of all the times the client disconnects
   */
  const disconnections = fromEvent(client, "end");

  /**
   * Get the light with the specific id from the database.
   * Will return an error if the light was not found.
   * @param {string} id
   */
  const getLight = async id => {
    if (!client.connected) {
      return {
        error: new Error(`Can not get "${id}". Not connected to Redis`)
      };
    }

    let lightData, lightEffect;
    // Get data about the light
    try {
      lightData = await asyncHGETALL(id);
    } catch (error) {
      return { error };
    }

    // Get the light's effects
    try {
      lightEffect = await asyncSMEMBERS(lightData.effectsKey);
    } catch (error) {
      return { error };
    }

    // Convert that info into a javascript object
    const lightObject = {
      id,
      connected: lightData.connected,
      state: lightData.state,
      brightness: parseInt(lightData.brightness),
      color: {
        r: parseInt(lightData["color:red"]),
        g: parseInt(lightData["color:green"]),
        b: parseInt(lightData["color:blue"])
      },
      effect: lightData.effect,
      speed: parseInt(lightData.speed),
      supportedEffects: lightEffect
    };
    return { light: lightObject };
  };

  /**
   * Get all added lights from the database.
   */
  const getAllLights = async () => {
    if (!client.connected) {
      return {
        error: new Error("Can not get lights. Not connected to Redis")
      };
    }

    // Get all the light keys from redis
    let lightKeys;
    try {
      lightKeys = await asyncZRANGE("lightKeys", 0, -1);
    } catch (error) {
      return { error };
    }

    // For each light key, get the corresponding light data
    const mapLightPromises = lightKeys.map(async lightKey =>
      getLight(lightKey)
    );

    // Wait for all of the promises returned by getLight to resolve
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
  };

  /**
   * Set the light with the specific id to have a certain set of data.
   * The light must already exist in the database.
   * Will return an error if the light was not found.
   * @param {string} id
   * @param {object} lightData
   */
  const setLight = async (id, lightData) => {
    if (!client.connected) {
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
    // Add the state data
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
      return { error };
    }

    return getLight(id);
  };

  /**
   * Add a new light with the specified id.
   * Default values are provided
   * @param {string} id
   */
  const addLight = async id => {
    if (!client.connected) {
      return {
        error: new Error(`Can not add "${id}". Not connected to Redis`)
      };
    }

    let lightScore, addLightKeyResponse, addLightDataResponse;

    // TODO: Figure out what i am doing here
    try {
      lightScore = await asyncINCR("lightScore");
    } catch (error) {
      return { error };
    }

    // TODO: Figure out what i am doing here
    try {
      addLightKeyResponse = await asyncZADD("lightKeys", lightScore, id);
    } catch (error) {
      return { error };
    }

    // TODO: Figure out what i am doing here
    switch (addLightKeyResponse) {
      // If the response is 1, then adding the light was successful
      // If 0, it was unsuccessful
      case 1:
        debug("successfully added key");
        try {
          addLightDataResponse = await asyncHMSET(getNewRedisLight(id));
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

    // TODO: Figure out what i am doing here
    switch (addLightDataResponse) {
      // If the response is OK, then setting the light was successful
      case "OK":
        debug("Light successfully added");
        // Save the redis database to persistant storage
        client.BGSAVE();
        // Return the newly added light
        return getLight(id);
      default:
        return {
          error: new Error(
            'Could not add light key to redis. returned with response code != "OK"'
          )
        };
    }
  };

  /**
   * Remove the light with the specified id.
   * Will return an error if the light does not exist
   * TODO: Change this function to use hasLight() and return as success if the light does not exist anyway
   * @param {string} id
   */
  const removeLight = async id => {
    if (!client.connected) {
      return {
        error: new Error(`Can't remove "${id}". Not connected to redis`)
      };
    }

    let removeKeyResponse, deleteLightResponse;

    // TODO: Figure out what I am doing here
    try {
      removeKeyResponse = await asyncZREM("lightKeys", id);
    } catch (error) {
      return { error };
    }

    // TODO: Figure out what I am doing here
    switch (removeKeyResponse) {
      // If the response is 1, then deleting the lightKey was successful
      // If 0, it was unsuccessful
      case 1:
        debug("successfully deleted key");
        try {
          deleteLightResponse = await asyncDEL(id);
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
        // Save the redis database to persistant storage
        client.BGSAVE();
        // Return the id of the deleted light
        return { lightRemoved: { id } };
      default:
        return {
          error: new Error(
            "Could not remove light key from Redis. Response code != 1"
          )
        };
    }
  };

  /**
   * Checks to see if the light with the specified ID is currently in the database.
   * @param {string} id
   */
  const hasLight = async id => {
    if (!client.connected) {
      return {
        error: new Error(
          `Can not check if "${id}" was added. Not connected to Redis`
        )
      };
    }

    let lightScore;
    // May throw an error
    lightScore = await asyncZSCORE("lightKeys", id);

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
  };

  return Object.create({
    connections,
    disconnections,
    getAllLights,
    getLight,
    setLight,
    addLight,
    removeLight,
    hasLight
  });
};

module.exports = dbFactory;
