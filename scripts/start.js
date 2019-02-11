"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";
process.env.DEBUG = "main,config,server,service,db,pubsub,repo";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

const { execSync } = require("child_process");
const nodemon = require("nodemon");

let argv = process.argv.slice(2);

console.log("Spinning up Local MQTT broker");
process.env.MQTT_HOST = "localhost";
console.log("Spinning up Local Redis Server");
process.env.REDIS_HOST = "localhost";

// Start docker containers
execSync("docker-compose up -d broker redis", {
  stdio: [process.stdin, process.stdout] // Ignore stderr so nothing prints to the console if this fails.
});

if (argv.indexOf("--mock") >= 0) {
  console.log("Starting Mock Server");
  process.env.MOCK = true;
}

// TODO: Figure out how to get rid of that error that pops up.
nodemon(".");
