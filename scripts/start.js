"use strict";

process.env.NODE_ENV = "development";
process.env.DEBUG = "main,config,server,service,db,pubsub,lightService,discovery";

const spawn = require("cross-spawn");
const spawnArgs = require("spawn-args");
const { delimiter } = require("path");
const pathResolve = require("path").resolve;
const { execSync } = require("child_process");

// Crash on unhandled rejections
process.on("unhandledRejection", err => {
  throw err;
});

// Get start arguments
let argv = process.argv.slice(2);

// Handle mock server
if (argv.indexOf("--mock") >= 0) {
  console.log("Starting Mock Server");
  process.env.MOCK = true;
} else if (argv.indexOf("--remote") >= 0) {
  console.log("Starting Server with Remote services");
  process.env.MQTT_HOST = "prysma.local";
  process.env.REDIS_HOST = "prysma.local";
} else {
  // Start docker containers
  console.log("Spinning up Local MQTT broker");
  process.env.MQTT_HOST = "localhost";
  console.log("Spinning up Local Redis Server");
  process.env.REDIS_HOST = "localhost";
  execSync("docker-compose up -d broker redis", {
    stdio: [process.stdin, process.stdout] // Ignore stderr so nothing prints to the console if this fails.
  });
}

// Start Nodemon with cross-spawn
const args = spawnArgs("nodemon", { removequotes: "always" });
spawn.sync(args.shift(), args, {
  stdio: ["inherit", "inherit", "inherit"],
  cwd: process.cwd(),
  env: Object.assign({}, process.env, {
    PATH:
      process.env.PATH +
      delimiter +
      pathResolve(process.cwd(), "node_modules", ".bin")
  })
});
