"use strict";
const mqtt = require("async-mqtt");

const connect = options =>
  mqtt.connect(options.host, {
    reconnectPeriod: options.reconnectPeriod, // Amount of time between reconnection attempts
    username: options.username,
    password: options.password
  });

module.exports = Object.assign({}, { connect });
