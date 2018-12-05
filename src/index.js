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
var amqp = require("amqplib/callback_api");

amqp.connect(
  "amqp://localhost",
  function(err, conn) {
    console.log(err);
    conn.createChannel(function(err, ch) {
      console.log(err);
      var q = "hello";
      var msg = "Hello World!";

      ch.assertQueue(q, { durable: false });
      ch.sendToQueue(q, Buffer.from(msg));
      console.log(" [x] Sent %s", msg);
    });
    setTimeout(function() {
      conn.close();
      process.exit(0);
    }, 500);
  }
);

amqp.connect(
  "amqp://localhost",
  function(err, conn) {
    console.log(err);
    conn.createChannel(function(err, ch) {
      console.log(err);
      var q = "hello";

      ch.assertQueue(q, { durable: false });
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
      ch.consume(
        q,
        function(msg) {
          console.log(" [x] Received %s", msg.content.toString());
        },
        { noAck: true }
      );
    });
  }
);

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
