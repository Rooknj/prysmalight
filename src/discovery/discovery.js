const { GET_DISCOVERED_LIGHTS } = require("../eventConstants");
const Debug = require("debug").default;
const { promisify } = require("util");

const asyncSetTimeout = promisify(setTimeout);
const debug = Debug("discovery");
const DISCOVERY_TOPIC = "prysmalight/+/config";

const createDiscoveryService = (mediator, mqttClient) => {
  let self;

  const start = async () => {
    // Handle MQTT Discovery Messages as they come in
    mqttClient.on("message", (topic, payload) => {
      if (topic.split("/")[2] !== "config") {
        return;
      }
      const msg = JSON.parse(payload.toString());
      debug("Discovery Message:", msg);
      self.onDiscoveryMessage(msg);
    });

    // Subscribe to discovery topic
    try {
      const granted = await mqttClient.subscribe(DISCOVERY_TOPIC);
      if (!granted[0]) {
        debug(`Subscription not granted`);
      } else {
        debug(
          `Subscribed to ${granted[0].topic} with a qos of ${granted[0].qos}`
        );
      }
    } catch (error) {
      console.log(error);
    }

    // Listen for RPC messages
    mediator.onRpcMessage(GET_DISCOVERED_LIGHTS, self.getDiscoveredLights);
  };

  const stop = async () => {
    console.log("Stop Discovery");
    await mqttClient.unsubscribe(DISCOVERY_TOPIC);
    mediator.removeRpcListener(GET_DISCOVERED_LIGHTS, self.getDiscoveredLights);
  };

  const lights = [];
  const onDiscoveryMessage = msg => {
    const { name, ipAddress, macAddress, numLeds, udpPort } = msg;
    if (!lights.find(light => light.id === name)) {
      lights.push({ id: name, ipAddress, macAddress, numLeds, udpPort });
    }
  };

  const getDiscoveredLights = async () => {
    try {
      await mqttClient.publish("prysmalight/discovery", "Hello");
      console.log(`Published hello to discovery`);
    } catch (error) {
      return error;
    }

    await asyncSetTimeout(100);

    return lights;
  };

  self = { start, stop, getDiscoveredLights, onDiscoveryMessage };

  return Object.assign({}, self);
};

module.exports = { createDiscoveryService };
