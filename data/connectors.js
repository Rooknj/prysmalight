import ChalkConsole from "../ChalkConsole.js";
import { connect } from "mqtt";
import { MQTTPubSub } from "graphql-mqtt-subscriptions"; // for connecting to mqtt
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
const client = connect(MQTT_CLIENT, {
  reconnectPeriod: 1000
});

// Fires on connect to MQTT server
const connectionListener = connection => {
  if (connection) {
    ChalkConsole.info(`Connected to ${MQTT_CLIENT}`);
    //console.log(connection);
  } else {
    ChalkConsole.error(`Failed to connect to ${MQTT_CLIENT}`);
  }
};

// Initialize MQTTPubSub
const pubsub = new MQTTPubSub({ client, connectionListener });

// Subscribe to the response topic
const subscribeTo = (topic, onMessage) => {
  pubsub
    .subscribe(topic, onMessage)
    .then(subId =>
      ChalkConsole.info(`Subscribed to ${topic} with an id of: ${subId}`)
    )
    .catch(error =>
      ChalkConsole.error(`Error subscribing to ${topic} Error: ${error}`)
    );
};

class LightConnector {
  constructor() {
    this.lights = [{ id: "Light 1" }];
    const onConnectedMessage = data => {
      console.log(`onConnected ${data}`);
      let connected;
      if (Number(data) === LIGHT_DISCONNECTED) {
        connected = false;
      } else if (Number(data) === LIGHT_CONNECTED) {
        connected = true;
      } else {
        return;
      }
      Object.assign(this.lights[0], { connected });
      console.log("Lights 1:", this.lights[0]);
    };
    const onPowerMessage = data => {
      console.log("onPower", data);
      let power;
      if (data === "ON") {
        power = true;
      } else if (data === "OFF") {
        power = false;
      } else {
        return;
      }
      Object.assign(this.lights[0], { power });
      console.log("Lights 1:", this.lights[0]);
    };
    const onBrightnessMessage = data => {
      console.log("onBrightness", data);
      if (Number(data) >= 0 && Number(data) <= 100) {
        Object.assign(this.lights[0], { brightness: data });
        console.log("Lights 1:", this.lights[0]);
      }
    };
    const onColorMessage = data => {
      console.log("onColor", data);
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
      console.log("Lights 1:", this.lights[0]);
    };
    subscribeTo(MQTT_LIGHT_CONNECTED_TOPIC, onConnectedMessage);
    subscribeTo(MQTT_LIGHT_STATE_TOPIC, onPowerMessage);
    subscribeTo(MQTT_LIGHT_BRIGHTNESS_STATE_TOPIC, onBrightnessMessage);
    subscribeTo(MQTT_LIGHT_RGB_STATE_TOPIC, onColorMessage);
  }

  getLight = lightId => {
    return this.lights[0];
  };

  setLight = light => {
    //TODO: call publish to all relevant topics then respond once the responses are in
    
    if ("power" in light) {
      pubsub.publish(MQTT_LIGHT_COMMAND_TOPIC, light.power ? "ON" : "OFF");
    }
    if ("brightness" in light) {
      pubsub.publish(MQTT_LIGHT_BRIGHTNESS_COMMAND_TOPIC, light.brightness);
    }
    if ("color" in light) {
      pubsub.publish(MQTT_LIGHT_RGB_COMMAND_TOPIC, `${light.color.r},${light.color.g},${light.color.b}`)
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
