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

const getMessageType = msg => msg[0].split("/")[2];
const getMessageSender = msg => msg[0].split("/")[1];
const getMessageData = msg => JSON.parse(msg[1].toString());
const toMessageObject = msg => ({
  sender: getMessageSender(msg),
  data: getMessageData(msg)
});

/**
 * Factory which returns an object with all mqtt methods.
 * @param {object} client - The MQTT client
 */
const pubsubFactory = client => {
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
      debug(
        `Subscribed to ${granted[0].topic} with a qos of ${granted[0].qos}`
      );
      return;
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
      return;
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
      return;
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

    let returnError;
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

    let returnError;
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
    return publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_COMMAND_TOPIC}`,
      Buffer.from(JSON.stringify(message))
    );
  };

  return Object.create({
    connections,
    disconnections,
    allMessages,
    connectMessages,
    stateMessages,
    effectMessages,
    subscribeToLight,
    unsubscribeFromLight,
    publishToLight
  });
};

module.exports = pubsubFactory;
