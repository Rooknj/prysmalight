const createLightService = require("./lightService");
const mediator = require("../mediator");
const dbFactory = require("./dbFactory");
const pubsubFactory = require("./pubsubFactory");
const config = require("../../config");

module.exports = () => {
  // Create a redis client
  const redisClient = config.redis.connect(config.redisSettings);

  // Create an MQTT client
  const mqttClient = config.mqtt.connect(config.mqttSettings);

  const db = dbFactory(redisClient);
  const pubsub = pubsubFactory({ client: mqttClient, mediator });

  // Start the lightService
  return createLightService({ mediator, db, pubsub });
};
