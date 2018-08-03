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

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const nodemon = require("nodemon");

let argv = process.argv.slice(2);

if (argv.indexOf("--mock") >= 0) {
  process.env.MOCKS = "Mock 1,Mock 2,Mock 3";
}

if (argv.indexOf("--local") >= 0) {
  console.log("Running Local MQTT broker");
  exec("docker-compose up -d broker");
  process.env.MQTT_HOST = "localhost";
}

exec("docker-compose up -d redis");

nodemon
  .on("start", function() {
    console.log("Server has started");
  })
  .on("quit", function() {
    console.log("Server has quit");
    process.exit();
  })
  .on("restart", function(files) {
    console.log("Server restarted due to: ", files);
  });

nodemon({
  script: "src/server.js",
  ext: "js json"
});
