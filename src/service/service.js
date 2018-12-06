const Debug = require("debug").default;
const debug = Debug("service");
const { promisify } = require("util");
const asyncSetTimeout = promisify(setTimeout);

const connect = async ({ amqp, amqpSettings }) => {
  // Validate the input
  if (!amqp)
    return {
      error: new Error("You must provide an amqp library"),
      service: null
    };
  if (!amqpSettings)
    return {
      error: new Error("You must provide amqp connection settings"),
      service: null
    };

  // Attempt to connect to rabbitMQ until successful
  const RETRY_DELAY = 5; // Retry delay in seconds
  let attemptNumber = 0,
    connected = false;
  while (!connected) {
    try {
      // Attempt the connection
      attemptNumber += 1;
      debug(`Attempt ${attemptNumber} to connect to rabbitMQ...`);
      const connection = await amqp.connect(amqpSettings);

      // Once the server is forced to close, close the rabbitMQ connection
      process.once("SIGINT", connection.close.bind(connection));
      debug(`Connected to rabbitMQ after ${attemptNumber} attempts.`);

      // return the connection
      return connection;
    } catch (err) {
      debug(
        `Error connecting to rabbitMQ. Retrying in ${RETRY_DELAY} seconds...`
      );

      // If it fails, wait for a time before retrying
      await asyncSetTimeout(RETRY_DELAY * 1000);
    }
  }
};

const start = async ({ amqp, amqpSettings, repo }) => {
  const conn = await connect({ amqp, amqpSettings });
  const GET_LIGHTS_Q = "getLights";

  conn.createChannel().then(ch => {
    ch.assertQueue(GET_LIGHTS_Q).then(() => {
      //Watch incomming messages
      ch.consume(GET_LIGHTS_Q, async msg => {
        // Get the lights
        const lights = await repo.getLights();
        const response = Buffer.from(JSON.stringify(lights));

        //Send back to the sender (replyTo) queue and give the correlationId back
        //so we can emit the event.
        ch.sendToQueue(msg.properties.replyTo, response, {
          correlationId: msg.properties.correlationId
        });

        //Acknowledge the job done with the message.
        ch.ack(msg);
      });
    });
  });
};

module.exports = Object.assign({}, { start });
