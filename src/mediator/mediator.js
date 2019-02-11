"use strict";

// Random id generator
const generateRandomId = () =>
  new Date().getTime().toString() +
  Math.random().toString() +
  Math.random().toString();

const mediatorFactory = (eventEmitter, redisClient) => {
  const pub = redisClient.duplicate();
  const sub = redisClient.duplicate();
  sub.on("subscribe", channel => {
    console.log(`Subscribed to ${channel}`);
  });

  sub.on("message", (topic, message) => {
    console.log("sub channel " + topic + ": " + message);
    eventEmitter.emit(`remote ${topic}`, message);
  });

  /**
   * Sends a message to an RPC server and waits for the reply.
   * @param {string} topic - the topic to send on
   * @param {object} parameters - rpc function parameters
   * @param {string} correlationId - unique id for the message
   * @param {object} options
   */
  const sendRpcMessage = (topic, parameters, options = {}) => {
    const TIMEOUT = options.timeout || 5000;
    const TIMEOUT_ERROR_MESSAGE =
      options.timeoutMessage || `Message Timed Out After ${TIMEOUT}ms`;

    return new Promise(resolve => {
      // Generate a unique topic id
      const id = generateRandomId();

      if (options.remote) {
        console.log("Remote Send RPC");
      } else {
        // Resolve once a response to the topic was received
        eventEmitter.once(id, response => {
          resolve(response);
        });

        eventEmitter.emit(topic, { correlationId: id, parameters });
      }

      setTimeout(() => {
        resolve(new Error(TIMEOUT_ERROR_MESSAGE));
      }, TIMEOUT);
    });
  };

  /**
   * Listens for RPC messages, calls the RPC function with the message contents, then returns the response to the RPC client.
   * @param {string} topic
   * @param {function} messageHandler
   */
  const onRpcMessage = (topic, messageHandler, options = {}) => {
    if (options.remote) {
      console.log("onRpcMessage remote");
    } else {
      eventEmitter.on(topic, msg => {
        const { correlationId, parameters } = msg;

        const response = messageHandler(parameters);

        eventEmitter.emit(correlationId, response);
      });
    }
  };

  const removeRpcListener = (topic, messageHandler, options = {}) => {
    if (options.remote) {
      console.log("removeRPCListener remote");
    } else {
      eventEmitter.removeListener(topic, messageHandler);
    }
  };

  const publish = (topic, message, options = {}) => {
    if (options.remote) {
      console.log("publish remote");
    } else {
      eventEmitter.emit(topic, message);
    }
  };

  const subscribe = (topic, messageHandler, options = {}) => {
    if (options.remote) {
      console.log("subscribe remote");
    } else {
      eventEmitter.on(topic, messageHandler);
    }
  };

  const unsubscribe = (topic, messageHandler, options = {}) => {
    if (options.remote) {
      console.log("unsubscribe remote");
    } else {
      eventEmitter.removeListener(topic, messageHandler);
    }
  };

  // REMOTE PUBSUB STUFF: MOVE/REFINE THIS LATER

  const publishRemote = (topic, message) => {
    pub.publish(topic, message);
  };

  const subscribeRemote = (topic, messageHandler) => {
    //eventEmitter.on(event, messageHandler);
    eventEmitter.on(`remote ${topic}`, messageHandler);
    sub.subscribe(topic);
  };

  return Object.assign(
    {},
    {
      sendRpcMessage,
      onRpcMessage,
      removeRpcListener,
      publish,
      subscribe,
      unsubscribe,
      publishRemote,
      subscribeRemote
    }
  );
};

module.exports = mediatorFactory;
