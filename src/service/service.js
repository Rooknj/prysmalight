const Debug = require("debug").default;
const debug = Debug("service");
const { promisify } = require("util");
const asyncSetTimeout = promisify(setTimeout);

const ALL_LIGHTS_SUBSCRIPTION_TOPIC = "lightsChanged";
const LIGHT_ADDED_SUBSCRIPTION_TOPIC = "lightAdded";
const LIGHT_REMOVED_SUBSCRIPTION_TOPIC = "lightRemoved";

// TODO: Pass this in as a depencency for testing purposes
const { EventEmitter } = require("events");
const eventEmitter = new EventEmitter();

//Random id generator
const generateRandomId = () =>
  new Date().getTime().toString() +
  Math.random().toString() +
  Math.random().toString();

// JSON Buffer Generator
const toJsonBuffer = object => Buffer.from(JSON.stringify(object));

const serviceFactory = ({ conn, rpcChannel, gqlPubSub }) => {
  const GET_LIGHT_Q = "getLight";
  const GET_LIGHTS_Q = "getLights";
  const SET_LIGHT_Q = "setLight";
  const ADD_LIGHT_Q = "addLight";
  const REMOVE_LIGHT_Q = "removeLight";

  let self = {};
  const mockLight = {
    id: "Mock Service Light 1",
    connected: true,
    state: "ON",
    brightness: 72,
    color: { r: 0, g: 127, b: 255 },
    effect: "None",
    speed: 3,
    supportedEffects: ["Effect 1", "Effect 2", "Effect 3"]
  };

  const sendRpcMessage = (q, id, message) => {
    //Checks if the queue exists, and create it if needed.
    rpcChannel
      .assertQueue(q)
      //Sent the buffered img to the queue with the ID and the responseQueue
      .then(() =>
        rpcChannel.sendToQueue(q, toJsonBuffer(message), {
          correlationId: id,
          replyTo: "amq.rabbitmq.reply-to"
        })
      );
  };

  const getLight = lightId =>
    new Promise((resolve, reject) => {
      const id = generateRandomId();

      //Event listener that will fire when the proper randomid is provided
      eventEmitter.once(id, msg => {
        const { error, data } = JSON.parse(msg);
        resolve(error ? new Error(error) : data.light);
      });

      const message = { lightId };

      //Checks if the queue exists, and create it if needed.
      sendRpcMessage(GET_LIGHT_Q, id, message);
    });

  const getLights = () =>
    new Promise((resolve, reject) => {
      const id = generateRandomId();

      //Event listener that will fire when the proper randomid is provided
      eventEmitter.once(id, msg => {
        const { error, data } = JSON.parse(msg);
        resolve(error ? new Error(error) : data.lights);
      });

      sendRpcMessage(GET_LIGHTS_Q, id, null);
    });

  const setLight = (lightId, lightData) =>
    new Promise((resolve, reject) => {
      const id = generateRandomId();

      //Event listener that will fire when the proper randomid is provided
      eventEmitter.once(id, msg => {
        const { error, data } = JSON.parse(msg);
        resolve(error ? new Error(error) : data.changedLight);
      });
      const message = { lightId, lightData };

      //Checks if the queue exists, and create it if needed.
      sendRpcMessage(SET_LIGHT_Q, id, message);
    });

  const addLight = lightId =>
    new Promise((resolve, reject) => {
      const id = generateRandomId();

      //Event listener that will fire when the proper randomid is provided
      eventEmitter.once(id, msg => {
        console.log(JSON.parse(msg));
        const { error, data } = JSON.parse(msg);
        if (!error)
          gqlPubSub.publish("lightAdded", { lightAdded: data.lightAdded });
        resolve(error ? new Error(error) : data.lightAdded);
      });

      const message = { lightId };

      //Checks if the queue exists, and create it if needed.
      sendRpcMessage(ADD_LIGHT_Q, id, message);
    });

  const removeLight = lightId =>
    new Promise((resolve, reject) => {
      const id = generateRandomId();

      //Event listener that will fire when the proper randomid is provided
      eventEmitter.once(id, msg => {
        console.log(JSON.parse(msg));
        const { error, data } = JSON.parse(msg);
        if (!error)
          gqlPubSub.publish("lightRemoved", {
            lightRemoved: data.lightRemoved
          });
        resolve(error ? new Error(error) : data.lightRemoved);
      });

      const message = { lightId };

      //Checks if the queue exists, and create it if needed.
      sendRpcMessage(REMOVE_LIGHT_Q, id, message);
    });
  /**
   * Subscribes to the changes of a specific light.
   * @param {string} lightId
   */
  const subscribeToLight = lightId => gqlPubSub.asyncIterator(lightId);

  /**
   * Subscribes to the changes of all lights.
   */
  const subscribeToAllLights = () =>
    gqlPubSub.asyncIterator(ALL_LIGHTS_SUBSCRIPTION_TOPIC);

  /**
   * Subscribes to lights being added.
   */
  const subscribeToLightsAdded = () =>
    gqlPubSub.asyncIterator(LIGHT_ADDED_SUBSCRIPTION_TOPIC);

  /**
   * Subscribes to lights being removed.
   */
  const subscribeToLightsRemoved = () =>
    gqlPubSub.asyncIterator(LIGHT_REMOVED_SUBSCRIPTION_TOPIC);

  self = {
    getLight,
    getLights,
    setLight,
    addLight,
    removeLight,
    subscribeToLight,
    subscribeToAllLights,
    subscribeToLightsAdded,
    subscribeToLightsRemoved
  };

  return Object.create(self);
};

const createRpcChannel = async conn => {
  const rpcChannel = await conn.createChannel();

  //this queue is a "Direct reply-to" read more at the docs
  //When some msg comes in, we "emit" a message to the proper "correlationId" listener
  rpcChannel.consume(
    "amq.rabbitmq.reply-to",
    msg => eventEmitter.emit(msg.properties.correlationId, msg.content),
    { noAck: true }
  );

  return rpcChannel;
};

// Connect to rabbitMQ then pass that connection to the service factory
const connect = async ({ amqp, amqpSettings, gqlPubSub }) => {
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
      const conn = await amqp.connect(amqpSettings);

      // Once the server is forced to close, close the rabbitMQ connection
      process.once("SIGINT", conn.close.bind(conn));
      debug(`Connected to rabbitMQ after ${attemptNumber} attempts.`);

      // Create an rpcChannel for direct response requests in rabbitMQ
      const rpcChannel = await createRpcChannel(conn);

      // Pass the connection and rpcChannel to the service factory
      return {
        error: null,
        service: serviceFactory({ conn, rpcChannel, gqlPubSub })
      };
    } catch (err) {
      debug(
        `Error connecting to rabbitMQ. Retrying in ${RETRY_DELAY} seconds...`
      );

      // If it fails, wait for a time before retrying
      await asyncSetTimeout(RETRY_DELAY * 1000);
    }
  }
};

module.exports = Object.assign({}, { connect });
