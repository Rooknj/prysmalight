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

const mockRepository = require("./mock/mockRepository");
const repo = mockRepository;
debug("Starting Server");
server
  .start({
    port: config.serverSettings.port,
    repo
  })
  .then(app => {
    app.on("close", () => {
      debug("App Closed");
    });
  });
