import MQTT from "async-mqtt";
import Debug from "debug";
import { parseMqttMessage, getMqttHost } from "../lightUtil";

const debug = Debug("MockLight");

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = "lightapp2";
const MQTT_LIGHT_CONNECTED_TOPIC = "connected";
const MQTT_LIGHT_STATE_TOPIC = "state";
const MQTT_LIGHT_COMMAND_TOPIC = "command";
const MQTT_EFFECT_LIST_TOPIC = "effects";

class MockLight {
  constructor(lightId) {
    this.mqttClient = MQTT.connect(getMqttHost(), {
      reconnectPeriod: 5000, // Amount of time between reconnection attempts
      username: "pi",
      password: "MQTTIsBetterThanUDP"
    });

    this.lightId = lightId;
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
    if (color) this.state.color = color;
    if (brightness) this.state.brightness = brightness;
    if (effect) this.state.effect = effect;
    if (speed) this.state.speed = speed;

    const response = { name: this.lightId, mutationId, ...this.state };
    this.publishState(response);
  }
}

export default MockLight;
