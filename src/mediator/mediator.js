"use strict";

// Random id generator
const generateRandomId = () =>
  new Date().getTime().toString() +
  Math.random().toString() +
  Math.random().toString();

const mediatorFactory = eventEmitter => {
  /**
   * Sends a message to an RPC server and waits for the reply.
   * @param {string} event - the topic to send on
   * @param {object} parameters - rpc function parameters
   * @param {string} correlationId - unique id for the message
   * @param {object} options
   */
  const sendRpcMessage = (event, parameters, options = {}) => {
    const TIMEOUT = options.timeout || 5000;
    const TIMEOUT_ERROR_MESSAGE =
      options.timeoutMessage || `Message Timed Out After ${TIMEOUT}ms`;

    return new Promise(resolve => {
      // Generate a unique event id
      const id = generateRandomId();

      // Resolve once a response to the event was received
      eventEmitter.once(id, response => {
        resolve(response);
      });

      eventEmitter.emit(event, { correlationId: id, parameters });

      setTimeout(() => {
        resolve(new Error(TIMEOUT_ERROR_MESSAGE));
      }, TIMEOUT);
    });
  };

  /**
   * Listens for RPC messages, calls the RPC function with the message contents, then returns the response to the RPC client.
   * @param {string} event
   * @param {function} messageHandler
   */
  const onRpcMessage = (event, messageHandler) => {
    eventEmitter.on(event, msg => {
      const { correlationId, parameters } = msg;

      const response = messageHandler(parameters);

      eventEmitter.emit(correlationId, response);
    });
  };

  const removeRpcListener = (event, messageHandler) => {
    eventEmitter.removeListener(event, messageHandler);
  };

  const publish = (event, message) => {
    eventEmitter.emit(event, message);
  };

  const subscribe = (event, messageHandler) => {
    eventEmitter.on(event, messageHandler);
  };

  const unsubscribe = (event, messageHandler) => {
    eventEmitter.removeListener(event, messageHandler);
  };

  return Object.assign(
    {},
    {
      sendRpcMessage,
      onRpcMessage,
      removeRpcListener,
      publish,
      subscribe,
      unsubscribe
    }
  );
};

module.exports = mediatorFactory;
