const Debug = require("debug").default;
const debug = Debug("service");
const { promisify } = require("util");
const asyncSetTimeout = promisify(setTimeout);

// JSON Buffer Generator
const toJsonBuffer = object => Buffer.from(JSON.stringify(object));

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
  const GET_LIGHT_Q = "getLight";
  const GET_LIGHTS_Q = "getLights";
  const SET_LIGHT_Q = "setLight";
  const ADD_LIGHT_Q = "addLight";
  const REMOVE_LIGHT_Q = "removeLight";

  // Creates a consumer which listens to a specific rabbitMQ queue and sends a response to sent messages
  const createConsumer = (q, getResponse) => {
    conn.createChannel().then(ch => {
      ch.assertQueue(q).then(() => {
        //Watch incomming messages
        ch.consume(q, async msg => {
          const response = await getResponse(msg);

          //Send back to the sender (replyTo) queue and give the correlationId back
          //so we can emit the event.
          ch.sendToQueue(msg.properties.replyTo, toJsonBuffer(response), {
            correlationId: msg.properties.correlationId
          });

          //Acknowledge the job done with the message.
          ch.ack(msg);
        });
      });
    });
  };

  // getLight
  createConsumer(GET_LIGHT_Q, async msg => {
    // Parse the message
    const msgData = JSON.parse(msg.content);

    // Get the light
    const light = await repo.getLight(msgData.lightId);

    // Generate a response message
    let response = { error: null, data: null };
    if (light instanceof Error) {
      response.error = light.message;
    } else {
      response.data = { light };
    }
    return response;
  });

  // getLights
  createConsumer(GET_LIGHTS_Q, async msg => {
    // Get the lights
    const lights = await repo.getLights();

    // Generate a response message
    let response = { error: null, data: null };
    if (lights instanceof Error) {
      response.error = lights.message;
    } else {
      response.data = { lights };
    }
    return response;
  });

  // setLight
  createConsumer(SET_LIGHT_Q, async msg => {
    // Parse the message
    const msgData = JSON.parse(msg.content);
    // Get the light
    const changedLight = await repo.setLight(
      msgData.lightId,
      msgData.lightData
    );

    // Generate a response message
    let response = { error: null, data: null };
    if (changedLight instanceof Error) {
      response.error = changedLight.message;
    } else {
      response.data = { changedLight };
    }
    return response;
  });

  // addLight
  createConsumer(ADD_LIGHT_Q, async msg => {
    // Parse the message
    const msgData = JSON.parse(msg.content);

    // Get the light
    const lightAdded = await repo.addLight(msgData.lightId);

    // Generate a response message
    let response = { error: null, data: null };
    if (lightAdded instanceof Error) {
      response.error = lightAdded.message;
    } else {
      response.data = { lightAdded };
    }
    console.log(response);
    return response;
  });

  // removeLight
  createConsumer(REMOVE_LIGHT_Q, async msg => {
    // Parse the message
    const msgData = JSON.parse(msg.content);

    // Get the light
    const lightRemoved = await repo.removeLight(msgData.lightId);

    // Generate a response message
    let response = { error: null, data: null };
    if (lightRemoved instanceof Error) {
      response.error = lightRemoved.message;
    } else {
      response.data = { lightRemoved };
    }
    console.log(response);
    return response;
  });
};

module.exports = Object.assign({}, { start });
