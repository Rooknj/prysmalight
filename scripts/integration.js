"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

const { execSync } = require("child_process");
const jest = require("jest");
let argv = process.argv.slice(2);

// Add the test/integration/ argument to the beginning of the array
// Makes jest only run the unit tests inside of the src/ folder
argv.unshift("test/integration/");

// Bring up server, redis, and broker

if (argv.indexOf("--rpi") >= 0) {
  argv.splice(argv.indexOf("--rpi"), 1); // Remove rpi option from argv so jest doesnt screw up
  console.log("Bringing up Raspberry Pi server, broker, and redis");
  execSync("docker-compose -f docker-compose.rpi.yml up -d");
} else {
  console.log("Bringing up server, broker, and redis");
  execSync("docker-compose up -d");
}

execSync("redis-cli flushall");
jest.run(argv);

