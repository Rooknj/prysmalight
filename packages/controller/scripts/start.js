"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";
process.env.DEBUG = "main,config,service,MockLight,db,pubsub,repo";

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
  console.log("Starting Mock Server");
  process.env.MOCK = true;
}

if (argv.indexOf("--local") >= 0) {
  console.log("Spinning up Local RabbitMQ broker");
  process.env.RABBIT_HOST = "localhost";
  console.log("Spinning up Local MQTT broker");
  process.env.MQTT_HOST = "localhost";

  // Start docker containers
  // TODO: Figure out a better way for microservices to share the broker
  try {
    execSync("docker-compose up -d rabbit broker", {
      stdio: [process.stdin, process.stdout] // Ignore stderr so nothing prints to the console if this fails.
    });
  } catch (error) {
    // If the first docker-compose failed, check to see if it was because there was already an instance of rabbitmq running.
    if (error.message.includes("rabbit")) {
      console.log(
        "RabbitMQ server already running locally from another microservice."
      );
      execSync("docker-compose up -d  broker");
    } else {
      console.log(error);
      process.exit(1);
    }
  }
}

if (!process.env.MOCK) {
  console.log("Spinning up Local Redis Server");
  execSync("docker-compose up -d redis");
}

// TODO: Figure out how to get rid of that error that pops up.
nodemon(".");
