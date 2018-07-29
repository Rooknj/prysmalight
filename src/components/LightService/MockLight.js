import MQTT from "async-mqtt";
import Debug from "debug";
import { parseMqttMessage, getMqttHost } from "./lightUtil";

const debug = Debug("MockLight");

const LIGHT_ID = "Test Light";

// MQTT: topics
const MQTT_LIGHT_TOP_LEVEL = "lightapp2";
const MQTT_LIGHT_CONNECTED_TOPIC = "connected";
const MQTT_LIGHT_STATE_TOPIC = "state";
const MQTT_LIGHT_COMMAND_TOPIC = "command";
const MQTT_EFFECT_LIST_TOPIC = "effects";

class MockLight {
  constructor() {
    this.mqttClient = MQTT.connect(getMqttHost(), {
      reconnectPeriod: 5000, // Amount of time between reconnection attempts
      username: "pi",
      password: "MQTTIsBetterThanUDP"
    });

    this.initWatchers();
    this.subscribeToCommands();
    this.publishInitial();
  }

  initWatchers() {
    this.mqttClient.on("message", this.handleMessage.bind(this));
  }

  publishInitial() {
    this.publishConnected(LIGHT_ID, 2);
    this.publishEffectList(LIGHT_ID, ["Test 1", "Test 2", "Test 3"]);
    this.publishState(LIGHT_ID, { name: LIGHT_ID, brightness: 99 });
  }

  handleMessage(topic, message) {
    // Convert message into a string
    const data = message.toString();
    debug(`Received message on topic ${topic} with a payload of ${data}`);
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
      return error;
    }
  }

  // Publish to the light. Returns error if unsuccessful
  async publishTo(topic, payload) {
    try {
      await this.mqttClient.publish(topic, payload);
      debug(`Published payload of ${payload} to ${topic}`);
      return;
    } catch (error) {
      return error;
    }
  }

  subscribeToCommands(id) {
    this.subscribeTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_COMMAND_TOPIC}`
    );
  }

  publishState(id, message) {
    this.publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_STATE_TOPIC}`,
      Buffer.from(JSON.stringify(message))
    );
  }

  publishEffectList(id, message) {
    this.publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_EFFECT_LIST_TOPIC}`,
      Buffer.from(JSON.stringify(message))
    );
  }

  publishConnected(id, message) {
    this.publishTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_CONNECTED_TOPIC}`,
      Buffer.from(JSON.stringify(message))
    );
  }
}

export default MockLight;
