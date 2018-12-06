const Debug = require("debug").default;
const debug = Debug("service");
const { promisify } = require("util");
const asyncSetTimeout = promisify(setTimeout);

const serviceFactory = ({ connection, repo }) => {
  console.log(connection, repo);
};

const connect = async ({ amqp, amqpSettings, repo }) => {
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

      // Pass the connection to the service factory
      return serviceFactory({ connection, repo });
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
  const service = await connect({ amqp, amqpSettings, repo });
};

module.exports = Object.assign({}, { start });
