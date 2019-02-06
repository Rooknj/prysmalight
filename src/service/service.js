"use strict";
const Debug = require("debug").default;
const debug = Debug("service");
const { promisify } = require("util");
const asyncSetTimeout = promisify(setTimeout);

const ALL_LIGHTS_SUBSCRIPTION_TOPIC = "lightsChanged";
const LIGHT_ADDED_SUBSCRIPTION_TOPIC = "lightAdded";
const LIGHT_REMOVED_SUBSCRIPTION_TOPIC = "lightRemoved";

const CONTROLLER_TIMEOUT = 5000;
const UPDATE_TIMEOUT = 120000; // 2 minutes
const REBOOT_TIMEOUT = 5000;

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

// Function to create a channel for Direct Reply To communication (used in service init function)
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

const serviceFactory = ({ conn, gqlPubSub }) => {
  const LIGHT_CHANGED_X = "changedLight";
  const UPDATE_HUB_Q = "updateHub";
  const REBOOT_HUB_Q = "rebootHub";

  let self = {};

  let rpcChannel = null;

  const init = async () => {
    // Create an rpcChannel for direct response requests in rabbitMQ
    rpcChannel = await createRpcChannel(conn);

    // Create a subscription channel
    const subChannel = await conn.createChannel();
    // Listen for changedLight messages
    subChannel.assertExchange(LIGHT_CHANGED_X, "fanout", { durable: false });
    subChannel.assertQueue("", { exclusive: true }).then(q => {
      subChannel.bindQueue(q.queue, LIGHT_CHANGED_X, "");
      subChannel.consume(
        q.queue,
        msg => {
          const msgData = JSON.parse(msg.content);

          // Publish to graphql subscriptions that a light has changed
          gqlPubSub.publish(msgData.lightChanged.id, {
            lightChanged: msgData.lightChanged
          });
          gqlPubSub.publish(ALL_LIGHTS_SUBSCRIPTION_TOPIC, {
            lightsChanged: msgData.lightChanged
          });
        },
        { noAck: true }
      );
    });
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

  const updateHub = () =>
    new Promise(resolve => {
      const id = generateRandomId();

      //Event listener that will fire when the proper randomid is provided
      eventEmitter.once(id, msg => {
        const { error, data } = JSON.parse(msg);
        resolve(error ? new Error(error) : data);
      });

      sendRpcMessage(UPDATE_HUB_Q, id, null);
      setTimeout(() => {
        resolve(new Error("Update Service timed out"));
      }, UPDATE_TIMEOUT);
    });

  const rebootHub = () =>
    new Promise(resolve => {
      const id = generateRandomId();

      //Event listener that will fire when the proper randomid is provided
      eventEmitter.once(id, msg => {
        const { error, data } = JSON.parse(msg);
        resolve(error ? new Error(error) : data);
      });

      sendRpcMessage(REBOOT_HUB_Q, id, null);
      setTimeout(() => {
        resolve(new Error("Reboot Service timed out"));
      }, REBOOT_TIMEOUT);
    });

  self = {
    init,
    subscribeToLight,
    subscribeToAllLights,
    subscribeToLightsAdded,
    subscribeToLightsRemoved,
    updateHub,
    rebootHub
  };

  return Object.create(self);
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

      return {
        error: null,
        service: serviceFactory({ conn, gqlPubSub })
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
