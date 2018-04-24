import ChalkConsole from "../ChalkConsole.js";
import MQTT from "async-mqtt";
import { PubSub } from "graphql-subscriptions";

// MQTT: client
const MQTT_CLIENT = "tcp://broker.hivemq.com:1883";

// MQTT: topics
// connection
const MQTT_LIGHT_CONNECTED_TOPIC = "office/rgb1/connected";

// state
const MQTT_LIGHT_STATE_TOPIC = "office/rgb1/light/status";
const MQTT_LIGHT_COMMAND_TOPIC = "office/rgb1/light/switch";

// brightness
const MQTT_LIGHT_BRIGHTNESS_STATE_TOPIC = "office/rgb1/brightness/status";
const MQTT_LIGHT_BRIGHTNESS_COMMAND_TOPIC = "office/rgb1/brightness/set";

// colors (rgb)
const MQTT_LIGHT_RGB_STATE_TOPIC = "office/rgb1/rgb/status";
const MQTT_LIGHT_RGB_COMMAND_TOPIC = "office/rgb1/rgb/set";

// MQTT: payloads by default (on/off)
const LIGHT_ON = "ON";
const LIGHT_OFF = "OFF";
const LIGHT_CONNECTED = 2;
const LIGHT_DISCONNECTED = 0;

// Connect to MQTT server
const mqttClient = MQTT.connect(MQTT_CLIENT, {
  reconnectPeriod: 5000 // Amount of time between reconnection attempts
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

// On connect
mqttClient.on("connect", () => {
  ChalkConsole.info(`Connected to MQTT broker`);
  subscribeTo(MQTT_LIGHT_CONNECTED_TOPIC);
  subscribeTo(MQTT_LIGHT_STATE_TOPIC);
  subscribeTo(MQTT_LIGHT_BRIGHTNESS_STATE_TOPIC);
  subscribeTo(MQTT_LIGHT_RGB_STATE_TOPIC);
});

// On reconnect attempt
mqttClient.on("reconnect", () => {
  ChalkConsole.debug(`Attempting reconnection to MQTT broker`);
});

// On connection or parsing error
mqttClient.on("error", error => {
  ChalkConsole.error(`Error connecting to MQTT broker. Error: ${error}`);
});

// Initialize PubSub
const pubsub = new PubSub();

class LightConnector {
  constructor() {
    // Light Data Store
    this.lights = [{ id: "Light 1" }];

    // MQTT Message Handlers
    const onConnectedMessage = data => {
      let connected;
      if (Number(data) === LIGHT_DISCONNECTED) {
        connected = false;
      } else if (Number(data) === LIGHT_CONNECTED) {
        connected = true;
      } else {
        return;
      }
      Object.assign(this.lights[0], { connected });
    };
    const onPowerMessage = data => {
      let power;
      if (data === "ON") {
        power = true;
      } else if (data === "OFF") {
        power = false;
      } else {
        return;
      }
      Object.assign(this.lights[0], { power });
    };
    const onBrightnessMessage = data => {
      if (Number(data) >= 0 && Number(data) <= 100) {
        Object.assign(this.lights[0], { brightness: data });
      }
    };
    const onColorMessage = data => {
      const color = data.split(",").map(value => Number(value));
      if (
        color.length !== 3 ||
        color[0] > 255 ||
        color[0] < 0 ||
        color[1] > 255 ||
        color[1] < 0 ||
        color[2] > 255 ||
        color[2] < 0
      ) {
        return;
      }
      Object.assign(this.lights[0], {
        color: { r: color[0], g: color[0], b: color[0] }
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
      } else if (topic === MQTT_LIGHT_BRIGHTNESS_STATE_TOPIC) {
        onBrightnessMessage(data);
      } else if (topic === MQTT_LIGHT_RGB_STATE_TOPIC) {
        onColorMessage(data);
      } else if (topic === MQTT_LIGHT_STATE_TOPIC) {
        onPowerMessage(data);
      }
    });
  }

  getLight = lightId => {
    return this.lights[0];
  };

  setLight = light => {
    //TODO: call publish to all relevant topics then respond once the responses are in

    if ("power" in light) {
      mqttClient.publish(
        MQTT_LIGHT_COMMAND_TOPIC,
        Buffer.from(light.power ? String(LIGHT_ON) : String(LIGHT_OFF))
      );
    }
    if ("brightness" in light) {
      mqttClient.publish(
        MQTT_LIGHT_BRIGHTNESS_COMMAND_TOPIC,
        Buffer.from(String(light.brightness))
      );
    }
    if ("color" in light) {
      mqttClient.publish(
        MQTT_LIGHT_RGB_COMMAND_TOPIC,
        Buffer.from(`${light.color.r},${light.color.g},${light.color.b}`)
      );
    }
    return this.lights[0];
  };

  subscribeLight = () => {
    return pubsub.asyncIterator([
      MQTT_LIGHT_CONNECTED_TOPIC,
      MQTT_LIGHT_STATE_TOPIC,
      MQTT_LIGHT_BRIGHTNESS_STATE_TOPIC,
      MQTT_LIGHT_RGB_STATE_TOPIC
    ]);
  };

  getLights = () => {
    console.log("INFO: Getting lights");
    return this.lights;
  };
}

export { LightConnector };
