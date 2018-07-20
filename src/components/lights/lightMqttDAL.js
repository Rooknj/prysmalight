import MQTT from "async-mqtt";
import ChalkConsole from "../../ChalkConsole";
import Light from "./light";

const light = new Light();

// MQTT: client
let MQTT_CLIENT;
if (process.env.MOCK) {
  MQTT_CLIENT = "tcp://broker.hivemq.com:1883";
} else if (process.env.NODE_ENV == "development") {
  MQTT_CLIENT = "tcp://raspberrypi.local:1883";
} else {
  MQTT_CLIENT = "tcp://localhost:1883";
}

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = "lightapp2";
const MQTT_LIGHT_CONNECTED_TOPIC = "connected";
const MQTT_LIGHT_STATE_TOPIC = "state";
const MQTT_LIGHT_COMMAND_TOPIC = "command";
const MQTT_EFFECT_LIST_TOPIC = "effects";

// Connect to MQTT server
// TODO: Might need to move this to the constructor
const mqttClient = MQTT.connect(MQTT_CLIENT, {
  reconnectPeriod: 5000, // Amount of time between reconnection attempts
  username: "pi",
  password: "MQTTIsBetterThanUDP"
});

// Subscribe method with logging
const subscribeTo = topic => {
  mqttClient
    .subscribe(topic)
    .then(granted =>
      ChalkConsole.info(
        `Subscribed to ${granted[0].topic} with a qos of ${granted[0].qos}`
      )
    )
    .catch(error =>
      ChalkConsole.error(`Error subscribing to ${topic} Error: ${error}`)
    );
};

// Publish method with logging
const publishTo = (topic, payload) => {
  mqttClient
    .publish(topic, payload)
    .then(() =>
      ChalkConsole.info(`Published payload of ${payload} to ${topic}`)
    )
    .catch(error =>
      ChalkConsole.error(`Error publishing to ${topic} Error: ${error}`)
    );
};

// Unsubscribe method with logging
const unsubscribeFrom = topic => {
  mqttClient
    .unsubscribe(topic)
    .then(() => ChalkConsole.info(`Unsubscribed from ${topic}`))
    .catch(error =>
      ChalkConsole.error(`Error unsubscribing from ${topic} Error: ${error}`)
    );
};

class LightMqttDAL {
  constructor() {
    this.connectionHandler = () => console.log("Connection Message");
    this.effectListHandler = () => console.log("Effect List Message");
    this.stateHandler = () => console.log("State Message");
    mqttClient.on("message", (topic, message) => {
      // Convert message into a string
      const data = message.toString();
      ChalkConsole.info(
        `Received message on topic ${topic} with a payload of ${data}`
      );

      // Split the topic into it's individual tokens to evaluate
      const topicTokens = topic.split("/");
      // If this mqtt message is not from lightapp2, then ignore it
      if (topicTokens[0] !== MQTT_LIGHT_TOP_LEVEL) {
        ChalkConsole.error(
          `Received messsage that belonged to a top level topic we are not supposed to be subscribed to`
        );
        return;
      }

      //TODO: Add error check if the light stored in this variable is in our database
      // Find the light the message pertains to in our database of lights
      const topicLight = light.getLight(topicTokens[1]);
      if (!topicLight) {
        ChalkConsole.error(
          `Could not find ${topicTokens[1]} in our database of lights`
        );
        return;
      }

      // Route each MQTT message to it's respective message handler depending on topic
      if (topicTokens[2] === MQTT_LIGHT_CONNECTED_TOPIC) {
        this.connectionHandler(data);
      } else if (topicTokens[2] === MQTT_LIGHT_STATE_TOPIC) {
        this.stateHandler(data);
      } else if (topicTokens[2] === MQTT_EFFECT_LIST_TOPIC) {
        this.effectListHandler(data);
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
