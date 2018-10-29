const MQTT = require("async-mqtt");
const Debug = require("debug").default;
const { parseMqttMessage } = require("./lightUtil");
const debug = Debug("LightLink");
const { mqttSettings } = require("../config/config");

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = mqttSettings.MQTT_LIGHT_TOP_LEVEL;
const MQTT_LIGHT_CONNECTED_TOPIC = mqttSettings.MQTT_LIGHT_CONNECTED_TOPIC;
const MQTT_LIGHT_STATE_TOPIC = mqttSettings.MQTT_LIGHT_STATE_TOPIC;
const MQTT_LIGHT_COMMAND_TOPIC = mqttSettings.MQTT_LIGHT_COMMAND_TOPIC;
const MQTT_EFFECT_LIST_TOPIC = mqttSettings.MQTT_EFFECT_LIST_TOPIC;

class LightLink {
  constructor() {
    this.isConnected = false;

    // Default connection handlers
    this.defaultConnectHandler = () => {
      debug(`Connected to MQTT broker`);
      this.isConnected = true;
    };
    this.defaultDisconnectHandler = () => {
      debug(`Disconnected from MQTT broker`);
      this.isConnected = false;
    };

    this.mqttClient = MQTT.connect(
      mqttSettings.host,
      {
        reconnectPeriod: mqttSettings.reconnectPeriod, // Amount of time between reconnection attempts
        username: mqttSettings.username,
        password: mqttSettings.password
      }
    );

    // Initialize Message handlers
    this.connectionHandler = () =>
      debug("Connection Message Handler wasnt set");
    this.effectListHandler = () =>
      debug("Effect List Message Handler wasnt set");
    this.stateHandler = () => debug("State Message Handler wasnt set");

    this.initWatchers();
  }

  handleMessage(topic, message) {
    // Convert message into a string
    const data = message.toString();
    debug(`Received message on topic ${topic} with a payload of ${data}`);

    // Split the topic into it's individual tokens to evaluate
    const topicTokens = topic.split("/");
    // If this mqtt message is not from lightapp2, then ignore it
    if (topicTokens[0] !== MQTT_LIGHT_TOP_LEVEL) {
      debug(
        `Received messsage that belonged to a top level topic we are not supposed to be subscribed to`
      );
      return;
    }

    // Parse the JSON into a usable javascript object
    const messageObject = parseMqttMessage(data);
    // Route each MQTT message to it's respective message handler depending on topic
    if (topicTokens[2] === MQTT_LIGHT_CONNECTED_TOPIC) {
      this.connectionHandler(messageObject);
    } else if (topicTokens[2] === MQTT_LIGHT_STATE_TOPIC) {
      this.stateHandler(messageObject);
    } else if (topicTokens[2] === MQTT_EFFECT_LIST_TOPIC) {
      this.effectListHandler(messageObject);
    } else {
      return;
    }
  }

  initWatchers() {
    this.mqttClient.on("connect", this.defaultConnectHandler);
    this.mqttClient.on("close", this.defaultDisconnectHandler);
    this.mqttClient.on("message", this.handleMessage.bind(this));
  }

  // Subscribe to the light. Returns error if unsuccessful
  async subscribeTo(topic) {
    try {
      const granted = await this.mqttClient.subscribe(topic);
      debug(
        `Subscribed to ${granted[0].topic} with a qos of ${granted[0].qos}`
      );
      return;
    } catch (error) {
      return error;
    }
  }
  // Publish to the light. Returns error if unsuccessful
  async publishTo(topic, payload) {
    try {
      await this.mqttClient.publish(topic, payload);
      debug(`Published payload of ${payload} to ${topic}`);
      return;
    } catch (error) {
      return error;
    }
  }
  // Unsubscribe from the light. Returns error if unsuccessful
  async unsubscribeFrom(topic) {
    try {
      await this.mqttClient.unsubscribe(topic);
      debug(`Unsubscribed from ${topic}`);
      return;
    } catch (error) {
      return error;
    }
  }

  onConnect(handler) {
    this.mqttClient.on("connect", handler);
  }

  onDisconnect(handler) {
    this.mqttClient.on("close", handler);
  }

  onReconnect(handler) {
    this.mqttClient.on("reconnect", handler);
  }

  onError(handler) {
    this.mqttClient.on("error", handler);
  }

  onConnectionMessage(handler) {
    this.connectionHandler = handler;
  }

  onStateMessage(handler) {
    this.stateHandler = handler;
  }

  onEffectListMessage(handler) {
    this.effectListHandler = handler;
  }

  async subscribeToLight(id) {
    if (!this.isConnected) {
      return new Error("Can't subscribe, not connected to MQTT broker");
    }

    const subscribedToConnected = this.subscribeTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    const subscribedToState = this.subscribeTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_STATE_TOPIC}`
    );
    const subscribedToEffectList = this.subscribeTo(
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
  }

  async unsubscribeFromLight(id) {
    if (!this.isConnected) {
      return;
    }

    const unsubscribedFromConnected = this.unsubscribeFrom(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    const unsubscribedFromState = this.unsubscribeFrom(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_STATE_TOPIC}`
    );
    const unsubscribedFromEffectList = this.unsubscribeFrom(
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
  }

  async publishToLight(id, message) {
    if (!this.isConnected) {
      return new Error(
        "Message could not be sent. Not connected to MQTT broker"
      );
    }

    return this.publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_COMMAND_TOPIC}`,
      Buffer.from(JSON.stringify(message))
    );
  }
}

module.exports = LightLink;
