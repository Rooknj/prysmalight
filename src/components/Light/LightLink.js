import MQTT from "async-mqtt";
import Debug from "debug";

const debug = Debug("LightLink");

// MQTT: client
let MQTT_BROKER = `tcp://raspberrypi.local:1883`;
if (process.env.MQTT_HOST) {
  debug("Adding custom MQTT host:", process.env.MQTT_HOST);
  MQTT_BROKER = `tcp://${process.env.MQTT_HOST}:1883`;
}

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = "lightapp2";
const MQTT_LIGHT_CONNECTED_TOPIC = "connected";
const MQTT_LIGHT_STATE_TOPIC = "state";
const MQTT_LIGHT_COMMAND_TOPIC = "command";
const MQTT_EFFECT_LIST_TOPIC = "effects";

// Connect to MQTT server
const mqttClient = MQTT.connect(MQTT_BROKER, {
  reconnectPeriod: 5000, // Amount of time between reconnection attempts
  username: "pi",
  password: "MQTTIsBetterThanUDP"
});

// Subscribe to the light and return 1 if successful
const subscribeTo = async topic => {
  try {
    const granted = await mqttClient.subscribe(topic);
    debug(`Subscribed to ${granted[0].topic} with a qos of ${granted[0].qos}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
};
// Publish to the light and return 1 if successful
const publishTo = async (topic, payload) => {
  try {
    await mqttClient.publish(topic, payload);
    debug(`Published payload of ${payload} to ${topic}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
};
// Unsubscribe from the light and return 1 if successful
const unsubscribeFrom = async topic => {
  try {
    await mqttClient.unsubscribe(topic);
    debug(`Unsubscribed from ${topic}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
};

// Utility functions
const parseMqttMessage = jsonData => {
  const message = JSON.parse(jsonData);

  if (!message.name) {
    debug(
      `Received a messsage that did not have an id. Ignoring\nMessage: ${message}`
    );
    return;
  }
  return message;
};

class LightLink {
  constructor() {
    this.isConnected = false;
    this.defaultConnectHandler = () => (this.isConnected = true);
    this.defaultDisconnectHandler = () => (this.isConnected = false);

    // Default message handlers
    this.connectionHandler = () => debug("Connection Message");
    this.effectListHandler = () => debug("Effect List Message");
    this.stateHandler = () => debug("State Message");

    mqttClient.on("connect", this.defaultConnectHandler);
    mqttClient.on("close", this.defaultDisconnectHandler);

    // Set up MQTT client to route messages to the appropriate callback handler function
    mqttClient.on("message", (topic, message) => {
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

      //TODO: Move this logic out of here and into the controller (maybe pass the lightId to the handler too)
      // Find the light the message pertains to in our database of lights
      // const topicLight = light.getLight(topicTokens[1]);
      // if (!topicLight) {
      //   ChalkConsole.error(
      //     `Could not find ${topicTokens[1]} in our database of lights`
      //   );
      //   return;
      // }

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
    });
  }

  onConnect(handler) {
    const newHandler = () => {
      this.defaultConnectHandler();
      handler();
    };
    mqttClient.on("connect", newHandler);
  }

  onDisconnect(handler) {
    const newHandler = () => {
      this.defaultDisconnectHandler();
      handler();
    };
    mqttClient.on("close", newHandler);
  }

  onReconnect(handler) {
    mqttClient.on("reconnect", handler);
  }

  onError(handler) {
    mqttClient.on("error", handler);
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

  // Returns 1 if successful, 0 if not
  async subscribeToLight(id) {
    if (!this.isConnected) {
      return {
        ok: false,
        error: new Error("Can't subscribe, not connected to MQTT broker")
      };
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

    let returnObject = { ok: true, error: null };
    // If any subscription failed, return 0
    subscriptionResponses.forEach(({ ok, error }) => {
      // if one of the subscriptions already failed, ignore processing on the rest
      if (!returnObject.ok) return;

      // If one of the subscriptions failed, set returnObject's error field
      if (!ok) {
        returnObject.ok = false;
        returnObject.error = error;
      }
    });

    return returnObject;
  }

  // Returns 1 if successful, 0 if not
  async unsubscribeFromLight(id) {
    if (!this.isConnected) {
      return { ok: true };
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

    let returnObject = { ok: true, error: null };
    // If any subscription failed, return 0
    unsubscriptionResponses.forEach(({ ok, error }) => {
      // if one of the subscriptions already failed, ignore processing on the rest
      if (!returnObject.ok) return;

      // If one of the subscriptions failed, set returnObject's error field
      if (!ok) {
        returnObject.ok = false;
        returnObject.error = error;
      }
    });

    return returnObject;
  }

  // Returns 1 if successful, 0 if not
  async publishToLight(id, message) {
    if (!this.isConnected) {
      return {
        ok: false,
        error: new Error(
          "Message could not be sent. Not connected to MQTT broker"
        )
      };
    }

    return publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_COMMAND_TOPIC}`,
      Buffer.from(JSON.stringify(message))
    );
  }
}

export default LightLink;
