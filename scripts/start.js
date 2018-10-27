"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";
process.env.DEBUG = "server,schema,LightService,LightDB,LightLink,LightUtil";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

const { execSync } = require("child_process");
const nodemon = require("nodemon");

let argv = process.argv.slice(2);

if (argv.indexOf("--mock") >= 0) {
  process.env.MOCK = true;
}

if (argv.indexOf("--local") >= 0) {
  console.log("Spinning up Local MQTT broker");
  process.env.MQTT_HOST = "localhost";
  execSync("docker-compose up -d broker");
}

if (!process.env.MOCK) {
  console.log("Spinning up Local Redis Server");
  execSync("docker-compose up -d redis");
}

// TODO: Figure out how to get rid of that error that pops up.
nodemon(".");
