"use strict";

const serverSettings = {
  port: process.env.PORT || 4001
};

const rabbitSettings = {
  protocol: "amqp",
  hostname: process.env.RABBIT_HOST || "localhost",
  port: 5672,
  username: "guest",
  password: "guest",
  locale: "en_US",
  frameMax: 0,
  heartbeat: 0,
  vhost: "/"
};

const mqttSettings = {
  host: process.env.REDIS_HOST || "localhost",
  reconnectPeriod: 5000, // Amount of time between reconnection attempts
  username: "pi",
  password: "MQTTIsBetterThanUDP",
  MQTT_LIGHT_TOP_LEVEL: "prysmalight",
  MQTT_LIGHT_CONNECTED_TOPIC: "connected",
  MQTT_LIGHT_STATE_TOPIC: "state",
  MQTT_LIGHT_COMMAND_TOPIC: "command",
  MQTT_EFFECT_LIST_TOPIC: "effects"
};

const redisSettings = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379
};

module.exports = Object.assign(
  {},
  { serverSettings, rabbitSettings, mqttSettings, redisSettings }
);
