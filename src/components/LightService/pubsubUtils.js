//mqtt.Client#connected

const MQTT = require("async-mqtt");
const Debug = require("debug").default;
const { parseMqttMessage } = require("./lightUtil");
const debug = Debug("pubsubUtils");

/**
 * Factory which returns an object with all mqtt methods
 * @param {object} client - The MQTT client
 */
const pubsubUtilsFactory = client => {
  return Object.create({});
};

/**
 * Checks to make sure a client was provided. If not, rejects with an error
 * @param {object} client - The MQTT client
 */
const connect = client => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error("Client not supplied!"));
    }
    resolve(pubsubUtilsFactory(client));
  });
};

module.exports = connect;
