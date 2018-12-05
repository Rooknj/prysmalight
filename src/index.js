const config = require("./config/config");
const server = require("./server/server");
const Debug = require("debug").default;
const debug = Debug("main");

// Verbose statement of service starting
debug("--- API Gateway Microservice ---");

// Unhandled error logging
process.on("uncaughtException", err => {
  debug("Unhandled Exception", err);
});
process.on("uncaughtRejection", err => {
  debug("Unhandled Rejection", err);
});

// RabbitMQ test
const amqp = require("amqplib");

const getAmqpClient = async () => {
  try {
    const channel = await amqp.connect(config.rabbitSettings.host);
    console.log(channel);
    return channel;
  } catch (error) {
    console.log(error);
  }
};

getAmqpClient();

// const mockRepository = require("./mock/mockRepository");
// const repo = mockRepository;
// debug("Starting Server");
// server
//   .start({
//     port: config.serverSettings.port,
//     repo
//   })
//   .then(app => {
//     app.on("close", () => {
//       debug("App Closed");
//     });
//   });
