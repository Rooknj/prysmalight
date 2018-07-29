import MQTT from "async-mqtt";
import Debug from "debug";
import { parseMqttMessage, getMqttHost } from "./lightUtil";

const debug = Debug("MockLight");

this.mqttClient = MQTT.connect(getMqttHost(), {
  reconnectPeriod: 5000, // Amount of time between reconnection attempts
  username: "pi",
  password: "MQTTIsBetterThanUDP"
});
