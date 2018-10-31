const Debug = require("debug").default;

const debug = Debug("lightUtil");

// MQTT: payloads by default
const LIGHT_CONNECTED = 2;
const LIGHT_DISCONNECTED = 0;

// Utility functions
const toConnectionString = connectionMessage => {
  let connectionString = -1;
  if (Number(connectionMessage) === LIGHT_DISCONNECTED) {
    connectionString = LIGHT_DISCONNECTED;
  } else if (Number(connectionMessage) === LIGHT_CONNECTED) {
    connectionString = LIGHT_CONNECTED;
  }
  return connectionString;
};

// Utility functions
const parseMqttMessage = jsonData => {
  const message = JSON.parse(jsonData);

  if (!message.name) {
    debug(
      `Received a messsage that did not have an id. Ignoring\nMessage: ${message}`
    );
    return;
  }
  return message;
};

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

const getMqttHost = () => {
  let MQTT_BROKER = `tcp://raspberrypi.local:1883`;
  if (process.env.MQTT_HOST) {
    debug(`Adding custom MQTT host: ${process.env.MQTT_HOST}`);
    MQTT_BROKER = `tcp://${process.env.MQTT_HOST}:1883`;
  }
  return MQTT_BROKER;
};

const getRedisHost = () => {
  let REDIS_HOST = "localhost";
  if (process.env.REDIS_HOST) {
    debug(`Adding custom Redis Host: ${process.env.REDIS_HOST}`);
    REDIS_HOST = process.env.REDIS_HOST;
  }
  return REDIS_HOST;
};

module.exports = {
  toConnectionString,
  parseMqttMessage,
  getNewRedisLight,
  mapRedisObjectToLightObject,
  getMqttHost,
  getRedisHost
};
