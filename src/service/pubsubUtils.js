const Debug = require("debug").default;
const debug = Debug("pubsubUtils");
const { mqttSettings } = require("../config/config");

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = mqttSettings.MQTT_LIGHT_TOP_LEVEL;
const MQTT_LIGHT_CONNECTED_TOPIC = mqttSettings.MQTT_LIGHT_CONNECTED_TOPIC;
const MQTT_LIGHT_STATE_TOPIC = mqttSettings.MQTT_LIGHT_STATE_TOPIC;
const MQTT_LIGHT_COMMAND_TOPIC = mqttSettings.MQTT_LIGHT_COMMAND_TOPIC;
const MQTT_EFFECT_LIST_TOPIC = mqttSettings.MQTT_EFFECT_LIST_TOPIC;

/**
 * Factory which returns an object with all mqtt methods.
 * @param {object} client - The MQTT client
 */
const pubsubUtilsFactory = client => {
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
    if (!client.connected) {
      return new Error("Can't subscribe, not connected to MQTT broker");
    }

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
    if (!client.connected) {
      return;
    }

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
    if (!client.connected) {
      return new Error(
        "Message could not be sent. Not connected to MQTT broker"
      );
    }

    return publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_COMMAND_TOPIC}`,
      Buffer.from(JSON.stringify(message))
    );
  };

  return Object.create({
    subscribeToLight,
    unsubscribeFromLight,
    publishToLight
  });
};

/**
 * Checks to make sure a client was provided. If not, rejects with an error
 * @param {object} client - The MQTT client
 */
const connect = client => {
  return new Promise((resolve, reject) => {
    if (!client) {
      reject(new Error("Client not supplied!"));
    }
    resolve(pubsubUtilsFactory(client));
  });
};

module.exports = connect;
