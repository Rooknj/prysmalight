const { promisify } = require("util");
const Debug = require("debug").default;
const debug = Debug("db");
const { fromEvent } = require("rxjs");

/**
 * Factory which returns an object with all database methods
 * @param {object} client - The Redis client
 */
const dbFactory = client => {
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

  // Initializing the self object which enables us to call sibiling methods
  //(ex: getAllLights calls self.getLight() instead of just getLight())
  let self = {};

  // Set the connected status of the client.
  // We have to do this because client.connected doesnt work for some reason
  client.on("connect", () => {
    debug("Connected to DB");
    self.connected = true;
  });
  client.on("end", () => {
    debug("disconnected from DB");
    self.connected = false;
  });

  // TODO: Find a better way to handle errors
  client.on("error", err => debug(err));
  // TODO: Find a way safely call BGSAVE when you are making a bunch of addLight requests in rapid succession
  // { ReplyError: ERR Background save already in progress
  //   at parseError (/snapshot/app/node_modules/redis-parser/lib/parser.js:193:12)
  //   at parseType (/snapshot/app/node_modules/redis-parser/lib/parser.js:303:14) command: 'BGSAVE', code: 'ERR' }

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
        error: new Error(`Can not get "${id}". Not connected to Redis`),
        light: null
      };
    }

    if (!id)
      return {
        error: new Error("You must provide an Id to getLight"),
        light: null
      };

    let lightData, lightEffect;
    // Get data about the light
    try {
      lightData = await asyncHGETALL(id);
    } catch (error) {
      return { error, light: null };
    }

    // If the data returned is null, that means it was not added
    if (!lightData)
      return { error: new Error(`"${id}" had no data`), light: null };

    // Get the light's effects
    try {
      lightEffect = await asyncSMEMBERS(lightData.effectsKey);
    } catch (error) {
      return { error, light: null };
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
    return { error: null, light: lightObject };
  };

  /**
   * Get all added lights from the database.
   */
  const getAllLights = async () => {
    if (!client.connected) {
      return {
        error: new Error("Can not get lights. Not connected to Redis"),
        lights: null
      };
    }

    // Get all the light keys from redis
    let lightKeys;
    try {
      lightKeys = await asyncZRANGE("lightKeys", 0, -1);
    } catch (error) {
      return { error, lights: null };
    }

    // For each light key, get the corresponding light data
    const mapLightPromises = lightKeys.map(async lightKey =>
      self.getLight(lightKey)
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
      return new Error(`Can not set "${id}". Not connected to Redis`);
    }

    // You need an id to set the light
    if (!id) {
      return new Error("No ID supplied to setLight()");
    }

    // You need data to set the light
    if (!lightData) {
      return new Error("No data supplied to setLight()");
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

    // If none of the provided lightData was relavent, return an error
    if (redisObject.length < 2) {
      return new Error("The Data Supplied to setLight() was not light data");
    }

    // Push data object to redis database
    const addLightDataPromise = asyncHMSET(redisObject);

    // Wait until all data is saved
    try {
      await Promise.all([addLightDataPromise, addEffectsPromise]);
    } catch (error) {
      return error;
    }

    return null;
  };

  /**
   * Add a new light with the specified id.
   * Default values are provided
   * May return an error
   * @param {string} id
   */
  const addLight = async id => {
    if (!client.connected) {
      return new Error(`Can not add "${id}". Not connected to Redis`);
    }

    if (!id) return new Error("You must provide an Id to addLight");

    // Increment the light score so that each light has a higher score than the previous
    let lightScore;
    try {
      lightScore = await asyncINCR("lightScore");
    } catch (error) {
      return error;
    }

    // Add the light id to an ordered set
    try {
      await asyncZADD("lightKeys", lightScore, id);
    } catch (error) {
      return error;
    }

    // Set the light's data to it's default value
    try {
      await asyncHMSET([
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
      ]);
    } catch (error) {
      return error;
    }

    // Save redis cache to persistant storage
    client.BGSAVE();

    // Return null as the error
    return null;
  };

  /**
   * Remove the light with the specified id.
   * May return an error
   * @param {string} id
   */
  const removeLight = async id => {
    if (!client.connected) {
      return new Error(`Can't remove "${id}". Not connected to redis`);
    }

    if (!id) return new Error("You must provide an Id to removeLight");

    // Delete the light's effect list
    try {
      await asyncDEL(`${id}:effects`);
    } catch (error) {
      return error;
    }

    // Delete the light's data
    try {
      await asyncDEL(id);
    } catch (error) {
      return error;
    }

    // Remove the light's id from the list of lights
    try {
      await asyncZREM("lightKeys", id);
    } catch (error) {
      return error;
    }

    // Save redis cache to persistant storage
    client.BGSAVE();

    // Return null as the error
    return null;
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
        ),
        hasLight: null
      };
    }

    if (!id)
      return {
        error: new Error("You must provide an Id to hasLight"),
        hasLight: null
      };

    let lightScore;

    // Get the score of the light
    try {
      lightScore = await asyncZSCORE("lightKeys", id);
    } catch (error) {
      return {
        error: error,
        hasLight: true
      };
    }

    // If the light has a score, it exists.
    if (lightScore) {
      return {
        error: null,
        hasLight: true
      };
    } else {
      return {
        error: null,
        hasLight: false
      };
    }
  };

  self = {
    connected: false,
    connections,
    disconnections,
    getAllLights,
    getLight,
    setLight,
    addLight,
    removeLight,
    hasLight
  };

  return Object.create(self);
};

module.exports = dbFactory;
