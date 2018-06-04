import ChalkConsole from "../ChalkConsole.js";
import MQTT from "async-mqtt";
import { PubSub } from "graphql-subscriptions";

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
// connection
const MQTT_LIGHT_CONNECTED_TOPIC = "lightapp2/light/connected";

// state
const MQTT_LIGHT_STATE_TOPIC = "lightapp2/light/state";
const MQTT_LIGHT_COMMAND_TOPIC = "lightapp2/light/command";
const MQTT_EFFECT_LIST_TOPIC = "lightapp2/light/effects";

// MQTT: payloads by default (on/off)
const LIGHT_ON = "ON";
const LIGHT_OFF = "OFF";
const LIGHT_CONNECTED = 2;
const LIGHT_DISCONNECTED = 0;

// Initialize PubSub
const pubsub = new PubSub();

// Connect to MQTT server
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

// Subscribe method with logging
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

// On connect
mqttClient.on("connect", () => {
  ChalkConsole.info(`Connected to MQTT broker`);
  subscribeTo(MQTT_LIGHT_CONNECTED_TOPIC);
  subscribeTo(MQTT_LIGHT_STATE_TOPIC);
  subscribeTo(MQTT_EFFECT_LIST_TOPIC);
});

// On reconnect attempt
mqttClient.on("reconnect", () => {
  ChalkConsole.debug(`Attempting reconnection to MQTT broker`);
});

// On connection or parsing error
mqttClient.on("error", error => {
  ChalkConsole.error(`Failed to connect to MQTT broker => ${error}`);
});

class LightConnector {
  constructor() {
    // Light Data Store
    this.lights = [{ id: "Light 1" }];

    // MQTT Message Handlers
    const onConnectedMessage = data => {
      let connected;
      if (Number(data) === LIGHT_DISCONNECTED) {
        connected = LIGHT_DISCONNECTED;
      } else if (Number(data) === LIGHT_CONNECTED) {
        connected = LIGHT_CONNECTED;
      } else {
        ChalkConsole.error(
          `Received messsage on connected topic that was not in the correct format\nMessage: ${data}`
        );
        return;
      }
      Object.assign(this.lights[0], { connected });
      pubsub.publish("lightChanged", { lightChanged: { connected } });
    };

    const onStateMessage = data => {
      const message = JSON.parse(data);
      // TODO: add data checking
      const { state, brightness, color, effect, speed } = message;
      let newState = {};
      if (state) newState = { ...newState, state };
      if (brightness) newState = { ...newState, brightness };
      if (color) newState = { ...newState, color };
      if (effect) newState = { ...newState, effect };
      if (speed) newState = { ...newState, speed };
      Object.assign(this.lights[0], newState);
      pubsub.publish("lightChanged", { lightChanged: newState });
    };

    const onEffectListMessage = data => {
      const effectList = JSON.parse(data);

      Object.assign(this.lights[0], { supportedEffects: effectList });
      pubsub.publish("lightChanged", {
        lightChanged: { supportedEffects: effectList }
      });
    };

    // Route each MQTT topic to it's respective message handler
    mqttClient.on("message", (topic, message) => {
      const data = message.toString();
      ChalkConsole.info(
        `Received message on topic ${topic} with a payload of ${data}`
      );
      if (topic === MQTT_LIGHT_CONNECTED_TOPIC) {
        onConnectedMessage(data);
      } else if (topic === MQTT_LIGHT_STATE_TOPIC) {
        onStateMessage(data);
      } else if (topic === MQTT_EFFECT_LIST_TOPIC) {
        onEffectListMessage(data);
      } else {
        ChalkConsole.error(
          `Received messsage that belonged to a topic we are not supposed to be subscribed to`
        );
        return;
      }
    });
  }

  getLight = lightId => {
    return this.lights[0];
  };

  setLight = light => {
    const { state, brightness, color, effect, speed } = light;
    // TODO: add data checking
    let payload = { name: "Light 1" };
    if (state) payload = { ...payload, state };
    if (brightness) payload = { ...payload, brightness };
    if (color) payload = { ...payload, color };
    if (effect) payload = { ...payload, effect };
    if (speed) payload = { ...payload, speed };
    console.log("payload:", payload);
    publishTo(MQTT_LIGHT_COMMAND_TOPIC, Buffer.from(JSON.stringify(payload)));
    return true;
  };

  subscribeLight = () => {
    return pubsub.asyncIterator("lightChanged");
  };

  getLights = () => {
    return this.lights;
  };
}

export { LightConnector };
