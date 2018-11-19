const MQTT = require("async-mqtt");
const Debug = require("debug").default;
const debug = Debug("MockLight");
const { mqttSettings } = require("../config/config");

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = mqttSettings.MQTT_LIGHT_TOP_LEVEL;
const MQTT_LIGHT_CONNECTED_TOPIC = mqttSettings.MQTT_LIGHT_CONNECTED_TOPIC;
const MQTT_LIGHT_STATE_TOPIC = mqttSettings.MQTT_LIGHT_STATE_TOPIC;
const MQTT_LIGHT_COMMAND_TOPIC = mqttSettings.MQTT_LIGHT_COMMAND_TOPIC;
const MQTT_EFFECT_LIST_TOPIC = mqttSettings.MQTT_EFFECT_LIST_TOPIC;

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

class MockLight {
  constructor(lightId) {
    this.lightId = lightId;

    this.mqttClient = MQTT.connect(
      mqttSettings.host,
      {
        reconnectPeriod: mqttSettings.reconnectPeriod, // Amount of time between reconnection attempts
        username: mqttSettings.username,
        password: mqttSettings.password,
        will: {
          topic: `${MQTT_LIGHT_TOP_LEVEL}/${
            this.lightId
          }/${MQTT_LIGHT_CONNECTED_TOPIC}`,
          payload: Buffer.from(
            JSON.stringify({ name: this.lightId, connection: 0 })
          ),
          qos: 0,
          retain: true
        }
      }
    );

    this.state = {
      state: "OFF",
      color: { r: 255, g: 100, b: 0 },
      brightness: 100,
      effect: "None",
      speed: 4
    };

    this.initWatchers();
  }

  initWatchers() {
    this.mqttClient.on("message", this.handleMessage.bind(this));
  }

  // Publish to the light. Returns error if unsuccessful
  async publishTo(topic, payload) {
    try {
      await this.mqttClient.publish(topic, payload, { retain: true });
      debug(`Published payload of ${payload} to ${topic}`);
      return;
    } catch (error) {
      debug(error);
      return error;
    }
  }

  publishState(state) {
    return this.publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${this.lightId}/${MQTT_LIGHT_STATE_TOPIC}`,
      Buffer.from(JSON.stringify(state))
    );
  }

  publishEffectList(effectList) {
    return this.publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${this.lightId}/${MQTT_EFFECT_LIST_TOPIC}`,
      Buffer.from(JSON.stringify(effectList))
    );
  }

  publishConnected(connectedStatus) {
    return this.publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${this.lightId}/${MQTT_LIGHT_CONNECTED_TOPIC}`,
      Buffer.from(JSON.stringify(connectedStatus))
    );
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
      debug(error);
      return error;
    }
  }

  subscribeToCommands() {
    return this.subscribeTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${this.lightId}/${MQTT_LIGHT_COMMAND_TOPIC}`
    );
  }

  handleMessage(topic, message) {
    // TODO: Implement
    // Convert message into a string
    const data = message.toString();
    debug(`Received message on topic ${topic} with a payload of ${data}`);

    // Parse the JSON into a usable javascript object
    const {
      mutationId,
      state,
      color,
      brightness,
      effect,
      speed
    } = parseMqttMessage(data);

    // Set the new state
    if (state) this.state.state = state;
    if (color) {
      this.state.effect = "None";
      this.state.color = color;
      this.state.state = "ON";
    }
    if (brightness) this.state.brightness = brightness;
    if (effect) {
      this.state.effect = effect;
      this.state.color = { r: 0, g: 0, b: 0 };
      this.state.state = "ON";
    }
    if (speed) this.state.speed = speed;

    const response = { name: this.lightId, mutationId, ...this.state };
    this.publishState(response);
  }
}

module.exports = MockLight;
