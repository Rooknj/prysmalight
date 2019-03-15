"use strict";
const redis = require("redis");

const connect = options => redis.createClient(options.port, options.host);

module.exports = Object.assign({}, { connect });
