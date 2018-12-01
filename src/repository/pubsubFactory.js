const Debug = require("debug").default;
const debug = Debug("pubsub");
const { mqttSettings } = require("../config/config");
const { fromEvent } = require("rxjs");
const { filter, map } = require("rxjs/operators");

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = mqttSettings.MQTT_LIGHT_TOP_LEVEL;
const MQTT_LIGHT_CONNECTED_TOPIC = mqttSettings.MQTT_LIGHT_CONNECTED_TOPIC;
const MQTT_LIGHT_STATE_TOPIC = mqttSettings.MQTT_LIGHT_STATE_TOPIC;
const MQTT_LIGHT_COMMAND_TOPIC = mqttSettings.MQTT_LIGHT_COMMAND_TOPIC;
const MQTT_EFFECT_LIST_TOPIC = mqttSettings.MQTT_EFFECT_LIST_TOPIC;

// TODO: Move these functions to a testable area
const getMessageType = msg => msg[0].split("/")[2];
// TODO: Add error handling if the message is not in JSON format
const toMessageObject = msg => JSON.parse(msg[1].toString());

/**
 * Factory which returns an object with all mqtt methods.
 * @param {object} client - The MQTT client
 */
const pubsubFactory = client => {
  // Initializing the self object which enables us to access connected
  let self = {};

  // Set the connected status of the client.
  // We have to do this because client.connected doesnt work for some reason
  client.on("connect", () => {
    debug("Connected to MQTT");
    self.connected = true;
  });
  client.on("close", () => {
    debug("disconnected from MQTT");
    self.connected = false;
  });

  /**
   * An observable of all the times the client connects
   */
  const connections = fromEvent(client, "connect");

  /**
   * An observable of all the times the client disconnects
   */
  const disconnections = fromEvent(client, "close");

  /**
   * An observable of all messages received by the client
   */
  const allMessages = fromEvent(client, "message");

  /**
   * An observable of all light connection status messages received by the client
   */
  const connectMessages = allMessages.pipe(
    filter(msg => getMessageType(msg) === MQTT_LIGHT_CONNECTED_TOPIC),
    map(toMessageObject)
  );

  /**
   * An observable of all light state messages received by the client
   */
  const stateMessages = allMessages.pipe(
    filter(msg => getMessageType(msg) === MQTT_LIGHT_STATE_TOPIC),
    map(toMessageObject)
  );

  /**
   * An observable of all light effect list messages received by the client
   */
  const effectMessages = allMessages.pipe(
    filter(msg => getMessageType(msg) === MQTT_EFFECT_LIST_TOPIC),
    map(toMessageObject)
  );

  /**
   * Subscribes to an MQTT topic.
   * Returns an error if unsuccessful.
   * @param {string} topic
   */
  const subscribeTo = async topic => {
    try {
      const granted = await client.subscribe(topic);
      if (!granted[0]) {
        debug(`Already subscribed to ${topic}`);
      } else {
        debug(
          `Subscribed to ${granted[0].topic} with a qos of ${granted[0].qos}`
        );
      }
      return null;
    } catch (error) {
      return error;
    }
  };

  /**
   * Publishes a payload to an MQTT topic.
   * Returns an error if unsuccessful.
   * @param {string} topic
   * @param {string} payload
   */
  const publishTo = async (topic, payload) => {
    try {
      await client.publish(topic, payload);
      debug(`Published payload of ${payload} to ${topic}`);
      return null;
    } catch (error) {
      return error;
    }
  };

  /**
   * Unsubscribes from an MQTT topic.
   * Returns an error if unsuccessful.
   * @param {string} topic
   */
  const unsubscribeFrom = async topic => {
    try {
      await client.unsubscribe(topic);
      debug(`Unsubscribed from ${topic}`);
      return null;
    } catch (error) {
      return error;
    }
  };

  /**
   * Subscribes to all relavent light topics.
   * Will return an error if any of the subscriptions fail.
   * @param {string} id
   */
  const subscribeToLight = async id => {
    if (!self.connected)
      return new Error(
        `Can not subscribe to (${id}). MQTT client not connected`
      );

    if (!id) return new Error("You must provide an id to this function");

    const subscribedToConnected = subscribeTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    const subscribedToState = subscribeTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_STATE_TOPIC}`
    );
    const subscribedToEffectList = subscribeTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_EFFECT_LIST_TOPIC}`
    );

    const subscriptionResponses = await Promise.all([
      subscribedToConnected,
      subscribedToState,
      subscribedToEffectList
    ]);

    let returnError = null;
    // If any subscription failed, return 0
    subscriptionResponses.forEach(error => {
      // if one of the subscriptions already failed, ignore processing on the rest
      if (returnError) return;
      // If one of the subscriptions failed, set returnObject's error field
      if (error) returnError = error;
    });

    return returnError;
  };

  /**
   * Unsubscribes from all relavent light topics.
   * Will return an error if any of the unsubscriptions fail.
   * @param {string} id
   */
  const unsubscribeFromLight = async id => {
    if (!self.connected)
      return new Error(
        `Can not unsubscribe from (${id}). MQTT client not connected`
      );

    if (!id) return new Error("You must provide an id to this function");

    const unsubscribedFromConnected = unsubscribeFrom(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    const unsubscribedFromState = unsubscribeFrom(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_STATE_TOPIC}`
    );
    const unsubscribedFromEffectList = unsubscribeFrom(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_EFFECT_LIST_TOPIC}`
    );

    const unsubscriptionResponses = await Promise.all([
      unsubscribedFromConnected,
      unsubscribedFromState,
      unsubscribedFromEffectList
    ]);

    let returnError = null;
    // If any subscription failed, return 0
    unsubscriptionResponses.forEach(error => {
      // if one of the subscriptions already failed, ignore processing on the rest
      if (returnError) return;
      // If one of the subscriptions failed, set returnObject's error field
      if (error) returnError = error;
    });

    return returnError;
  };

  /**
   * Publishes a message to the light's command topic.
   * @param {string} id
   * @param {string} message
   */
  const publishToLight = async (id, message) => {
    if (!self.connected)
      return new Error(`Can not publish to (${id}). MQTT client not connected`);

    if (!id) return new Error("You must provide an id to this function");
    if (!message)
      return new Error("You must provide a message to this function");

    return publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_COMMAND_TOPIC}`,
      Buffer.from(JSON.stringify(message))
    );
  };

  self = {
    connected: false,
    connections,
    disconnections,
    allMessages,
    connectMessages,
    stateMessages,
    effectMessages,
    subscribeToLight,
    unsubscribeFromLight,
    publishToLight
  };

  return Object.create(self);
};

module.exports = pubsubFactory;
