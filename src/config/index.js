"use strict";
const config = require("./config");
const mqtt = require("./mqtt");
const redis = require("./redis");

module.exports = Object.assign({}, config, { mqtt }, { redis });
