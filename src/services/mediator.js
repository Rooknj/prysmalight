"use strict";
const config = require("../config");
const events = require("events");

const eventEmitter = new events.EventEmitter();
const pub = config.redis.connect(config.redisSettings);
const sub = pub.duplicate();

// Random id generator
const generateRandomId = () =>
  new Date().getTime().toString() +
  Math.random().toString() +
  Math.random().toString();

sub.on("subscribe", channel => {
  console.log(`Subscribed to ${channel}`);
});

sub.on("unsubscribe", channel => {
  console.log(`unSubscribed from ${channel}`);
});

sub.on("message", (topic, message) => {
  console.log("sub channel " + topic + ": " + message);
  eventEmitter.emit(topic, JSON.parse(message));
});

const mediator = {
  /**
   * Sends a message to an RPC server and waits for the reply.
   * @param {string} topic - the topic to send on
   * @param {object} parameters - rpc function parameters
   * @param {string} correlationId - unique id for the message
   * @param {object} options
   */
  sendRpcMessage: (topic, parameters, options = {}) => {
    const TIMEOUT = options.timeout || 5000;
    const TIMEOUT_ERROR_MESSAGE =
      options.timeoutMessage || `Message Timed Out After ${TIMEOUT}ms`;

    return new Promise((resolve, reject) => {
      // Generate a unique topic id
      const id = generateRandomId();

      // Resolve once a response to the topic was received
      const handleResponse = response => {
        resolve(response);
      };
      eventEmitter.once(id, handleResponse);

      if (options.remote) {
        sub.subscribe(id);
        pub.publish(topic, JSON.stringify({ correlationId: id, parameters }));
      } else {
        eventEmitter.emit(topic, { correlationId: id, parameters });
      }

      setTimeout(() => {
        mediator.removeRpcListener(id, handleResponse, options);
        reject(new Error(TIMEOUT_ERROR_MESSAGE));
      }, TIMEOUT);
    });
  },

  /**
   * Listens for RPC messages, calls the RPC function with the message contents, then returns the response to the RPC client.
   * @param {string} topic
   * @param {function} messageHandler
   */
  onRpcMessage: (topic, messageHandler, options = {}) => {
    if (options.remote) {
      sub.subscribe(topic);
    }

    eventEmitter.on(topic, async msg => {
      const { correlationId, parameters } = msg;

      const response = await messageHandler(parameters);

      if (options.remote) {
        pub.publish(correlationId, JSON.stringify(response));
      } else {
        eventEmitter.emit(correlationId, response);
      }
    });
  },

  removeRpcListener: (topic, messageHandler, options = {}) => {
    if (options.remote) {
      sub.unsubscribe(topic);
    }
    eventEmitter.removeListener(topic, messageHandler);
  },

  publish: (topic, message, options = {}) => {
    if (options.remote) {
      pub.publish(topic, JSON.stringify(message));
    } else {
      eventEmitter.emit(topic, message);
    }
  },

  subscribe: (topic, messageHandler, options = {}) => {
    if (options.remote) {
      sub.subscribe(topic);
    }
    eventEmitter.on(topic, messageHandler);
  },

  unsubscribe: (topic, messageHandler, options = {}) => {
    if (options.remote) {
      sub.unsubscribe(topic);
    }
    eventEmitter.removeListener(topic, messageHandler);
  }
};

module.exports = mediator;
