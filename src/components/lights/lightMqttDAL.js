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

// Subscribe method with logging
const subscribeTo = topic => {
  mqttClient
    .subscribe(topic)
    .then(granted =>
      debug(`Subscribed to ${granted[0].topic} with a qos of ${granted[0].qos}`)
    )
    .catch(error => debug(`Error subscribing to ${topic} Error: ${error}`));
};

// Publish method with logging
const publishTo = (topic, payload) => {
  mqttClient
    .publish(topic, payload)
    .then(() => debug(`Published payload of ${payload} to ${topic}`))
    .catch(error => debug(`Error publishing to ${topic} Error: ${error}`));
};

// Unsubscribe method with logging
const unsubscribeFrom = topic => {
  mqttClient
    .unsubscribe(topic)
    .then(() => debug(`Unsubscribed from ${topic}`))
    .catch(error => debug(`Error unsubscribing from ${topic} Error: ${error}`));
};

// Utility functions
const parseMqttMessage = jsonData => {
  const message = JSON.parse(jsonData);

  if (!message.name) {
    debug(
      `Received messsage on connected topic that did not have an id\nMessage: ${message}`
    );
    return;
  }
  return message;
};

class LightMqttDAL {
  constructor() {
    // Default message handlers
    this.connectionHandler = () => debug("Connection Message");
    this.effectListHandler = () => debug("Effect List Message");
    this.stateHandler = () => debug("State Message");

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
    mqttClient.on("connect", handler);
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

  subscribeToLight(id) {
    subscribeTo(`${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_CONNECTED_TOPIC}`);
    subscribeTo(`${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_STATE_TOPIC}`);
    subscribeTo(`${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_EFFECT_LIST_TOPIC}`);
  }

  unsubscribeFromLight(id) {
    unsubscribeFrom(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    unsubscribeFrom(`${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_STATE_TOPIC}`);
    unsubscribeFrom(`${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_EFFECT_LIST_TOPIC}`);
  }

  publishToLight(id, message) {
    publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_COMMAND_TOPIC}`,
      Buffer.from(JSON.stringify(message))
    );
  }
}

export default LightMqttDAL;
