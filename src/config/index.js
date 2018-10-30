const settings = require("./config");
const db = require("./redis.js");
const pubsub = require("./mqtt.js");

module.exports = Object.assign({}, settings, { db, pubsub });
