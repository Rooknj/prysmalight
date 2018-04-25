import ChalkConsole from "../ChalkConsole.js";
import MQTT from "async-mqtt";
import { PubSub } from "graphql-subscriptions";
import debounce from "lodash.debounce";

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

// Initialize PubSub
const pubsub = new PubSub();

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

const debouncePublishPower = debounce((topic, payload) => {
  pubsub.publish(topic, payload);
}, 500);

const debouncePublishBrightness = debounce((topic, payload) => {
  pubsub.publish(topic, payload);
}, 500);

const debouncePublishColor = debounce((topic, payload) => {
  pubsub.publish(topic, payload);
}, 500);

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

    const onPowerMessage = data => {
      let power;
      if (data === LIGHT_ON) {
        power = LIGHT_ON;
      } else if (data === LIGHT_OFF) {
        power = LIGHT_OFF;
      } else {
        ChalkConsole.error(
          `Received messsage on power topic that was not in the correct format\nMessage: ${data}`
        );
        return;
      }
      Object.assign(this.lights[0], { power });
      debouncePublishPower("lightChanged", { lightChanged: { power } });
    };

    const onBrightnessMessage = data => {
      if (Number(data) >= 0 && Number(data) <= 100) {
        Object.assign(this.lights[0], { brightness: data });
        debouncePublishBrightness("lightChanged", {
          lightChanged: { brightness: data }
        });
      } else {
        ChalkConsole.error(
          `Received messsage on brightness topic that was not in the correct format\nMessage: ${data}`
        );
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
        ChalkConsole.error(
          `Received messsage on rgb color topic that was not in the correct format\nMessage: ${data}`
        );
        return;
      }
      Object.assign(this.lights[0], {
        color: { r: color[0], g: color[1], b: color[2] }
      });
      debouncePublishColor("lightChanged", {
        lightChanged: { color: { r: color[0], g: color[1], b: color[2] } }
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
    //TODO: call publish to all relevant topics then respond once the responses are in
    let optimisticResponse = {};
    if ("power" in light) {
      const power = String(light.power);
      publishTo(MQTT_LIGHT_COMMAND_TOPIC, Buffer.from(power));
    }
    if ("brightness" in light) {
      const brightness = String(light.brightness);
      publishTo(MQTT_LIGHT_BRIGHTNESS_COMMAND_TOPIC, Buffer.from(brightness));
    }
    if ("color" in light) {
      const color = `${light.color.r},${light.color.g},${light.color.b}`;
      publishTo(MQTT_LIGHT_RGB_COMMAND_TOPIC, Buffer.from(color));
    }
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
