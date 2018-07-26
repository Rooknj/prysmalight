import MQTT from "async-mqtt";
import Debug from "debug";

const debug = Debug("mqttDAL");

// MQTT: client
let MQTT_BROKER = `tcp://raspberrypi.local:1883`;
if (process.env.MQTT_HOST) {
  debug("Adding custom MQTT host:", process.env.MQTT_HOST);
  MQTT_BROKER = `tcp://${process.env.MQTT_HOST}:1883`;
}
// if (process.env.MOCK) {
//   MQTT_CLIENT = "tcp://broker.hivemq.com:1883";
// } else if (process.env.NODE_ENV == "development") {
//   MQTT_CLIENT = "tcp://raspberrypi.local:1883";
// } else {
//   MQTT_CLIENT = ;
// }

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = "lightapp2";
const MQTT_LIGHT_CONNECTED_TOPIC = "connected";
const MQTT_LIGHT_STATE_TOPIC = "state";
const MQTT_LIGHT_COMMAND_TOPIC = "command";
const MQTT_EFFECT_LIST_TOPIC = "effects";

// Connect to MQTT server
// TODO: Might need to move this to the constructor
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
    return 1;
  } catch (error) {
    debug(error);
    return 0;
  }
};
// Publish to the light and return 1 if successful
const publishTo = async (topic, payload) => {
  try {
    await mqttClient.publish(topic, payload);
    debug(`Published payload of ${payload} to ${topic}`);
    return 1;
  } catch (error) {
    debug(error);
    return 0;
  }
};
// Unsubscribe from the light and return 1 if successful
const unsubscribeFrom = async topic => {
  try {
    await mqttClient.unsubscribe(topic);
    debug(`Unsubscribed from ${topic}`);
    return 1;
  } catch (error) {
    debug(error);
    return 0;
  }
};

// Utility functions
const parseMqttMessage = jsonData => {
  const message = JSON.parse(jsonData);

  if (!message.name) {
    debug(
      `Received messsage on connected topic that did not have an id. Ignoring\nMessage: ${message}`
    );
    return;
  }
  return message;
};

class LightMqttDAL {
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
      debug("Can't subscribe, not connected to MQTT broker");
      return 0;
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
    try {
      const subscriptionStatusArray = await Promise.all([
        subscribedToConnected,
        subscribedToState,
        subscribedToEffectList
      ]);

      let failedToSubscribe = false;
      // If any subscription failed, return 0
      subscriptionStatusArray.forEach(subscriptionStatus => {
        if (subscriptionStatus !== 1) {
          failedToSubscribe = true;
        }
      });
      if (failedToSubscribe) {
        debug(`Failed to subscribe to at least one topic`);
        return 0;
      }

      return 1;
    } catch (error) {
      debug(`error subscribing to "${id}": ${error}`);
      return 0;
    }
  }

  // Returns 1 if successful, 0 if not
  async unsubscribeFromLight(id) {
    if (!this.isConnected) {
      debug("Already unsubscribed as client is not connected to MQTT broker");
      return 1;
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
    try {
      const unsubscribeStatusArray = await Promise.all([
        unsubscribedFromConnected,
        unsubscribedFromState,
        unsubscribedFromEffectList
      ]);

      // If any unsubscribe failed, return 0
      unsubscribeStatusArray.forEach(unsubscribeStatus => {
        if (unsubscribeStatus !== 1) {
          debug("failed unsubscribing from at least one topic");
          return 0;
        }
      });

      return 1;
    } catch (error) {
      debug(`error unsubscribing from "${id}": ${error}`);
      return 0;
    }
  }

  // Returns 1 if successful, 0 if not
  async publishToLight(id, message) {
    if (!this.isConnected) {
      debug("Message could not be sent. Not connected to MQTT broker");
      return 0;
    }

    try {
      await publishTo(
        `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_COMMAND_TOPIC}`,
        Buffer.from(JSON.stringify(message))
      );
      return 1;
    } catch (error) {
      debug(`error publishing message to "${id}": ${error}`);
      return 0;
    }
  }
}

export default LightMqttDAL;
