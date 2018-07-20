import ChalkConsole from "../../ChalkConsole";
import MQTT from "async-mqtt";
import { PubSub } from "graphql-subscriptions";
import events from "events";

import Light from "./light";

const light = new Light();

// Instantiate the eventEmitter
const eventEmitter = new events.EventEmitter();

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

// MQTT: payloads by default
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

class LightConnector {
  constructor() {
    // Our mutation number to match each mutation to it's response
    this.mutationNumber = 0;
    this.isInitialized = false;
    // Start the initialize function
    this.init();
  }

  async init() {
    // Set up onConnect callback
    mqttClient.on("connect", () => {
      ChalkConsole.info(`Connected to MQTT broker`);
      light.getAllLights().forEach(light => {
        subscribeTo(
          `${MQTT_LIGHT_TOP_LEVEL}/${light.id}/${MQTT_LIGHT_CONNECTED_TOPIC}`
        );
        subscribeTo(
          `${MQTT_LIGHT_TOP_LEVEL}/${light.id}/${MQTT_LIGHT_STATE_TOPIC}`
        );
        subscribeTo(
          `${MQTT_LIGHT_TOP_LEVEL}/${light.id}/${MQTT_EFFECT_LIST_TOPIC}`
        );
      });
    });

    // Set up onReconnect callback
    mqttClient.on("reconnect", () => {
      ChalkConsole.debug(`Attempting reconnection to MQTT broker`);
    });

    // Set up onError callback
    mqttClient.on("error", error => {
      ChalkConsole.error(`Failed to connect to MQTT broker => ${error}`);
    });

    // MQTT Message Handlers
    // This gets triggered when the connection of the light changes
    const handleConnectedMessage = data => {
      const message = JSON.parse(data);

      if (!message.name) {
        ChalkConsole.error(
          `Received messsage on connected topic that did not have an id\nMessage: ${data}`
        );
        return;
      }

      let connected;
      if (Number(message.connection) === LIGHT_DISCONNECTED) {
        connected = LIGHT_DISCONNECTED;
      } else if (Number(message.connection) === LIGHT_CONNECTED) {
        connected = LIGHT_CONNECTED;
      } else {
        ChalkConsole.error(
          `Received messsage on connected topic that was not in the correct format\nMessage: ${data}`
        );
        return;
      }

      // Find the light in our data store whose id matches the message name
      const changedLight = light.getLight(message.name);
      // Push changes to existing light
      Object.assign(changedLight, { connected });
      pubsub.publish(message.name, { lightChanged: changedLight });
      pubsub.publish("lightsChanged", { lightsChanged: changedLight });
    };
    // This gets triggered when the state of the light changes
    const handleStateMessage = data => {
      const message = JSON.parse(data);
      if (!message.name) {
        ChalkConsole.error(
          `Received messsage on State topic that did not have an id\nMessage: ${data}`
        );
        return;
      }

      // TODO: add data checking
      const { mutationId, state, brightness, color, effect, speed } = message;
      let newState = {};
      if (state) newState = { ...newState, state };
      if (brightness) newState = { ...newState, brightness };
      if (color) newState = { ...newState, color };
      if (effect) newState = { ...newState, effect };
      if (speed) newState = { ...newState, speed };

      // Find the light in our data store whose id matches the message name
      const changedLight = light.getLight(message.name);
      // Push changes to existing light
      Object.assign(changedLight, newState);
      // Publish to the subscription async interator
      pubsub.publish(message.name, { lightChanged: changedLight });
      pubsub.publish("lightsChanged", { lightsChanged: changedLight });
      // Publish to the mutation response event
      eventEmitter.emit("mutationResponse", mutationId, changedLight);
    };
    // This gets triggered when the light sends its effect list
    const handleEffectListMessage = data => {
      const message = JSON.parse(data);

      if (!message.name) {
        ChalkConsole.error(
          `Received messsage on Effect List topic that did not have an id\nMessage: ${data}`
        );
        return;
      }

      // Find the light in our data store whose id matches the message name
      const changedLight = light.getLight(message.name);
      // Push changes to existing light
      Object.assign(changedLight, { supportedEffects: message.effectList });
      pubsub.publish(message.name, { lightChanged: changedLight });
      pubsub.publish("lightsChanged", { lightsChanged: changedLight });
    };

    // Set up onMessage callback
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
        handleConnectedMessage(data);
      } else if (topicTokens[2] === MQTT_LIGHT_STATE_TOPIC) {
        handleStateMessage(data);
      } else if (topicTokens[2] === MQTT_EFFECT_LIST_TOPIC) {
        handleEffectListMessage(data);
      } else {
        return;
      }
    });

    // Set isInitialized to true
    this.isInitialized = true;
  }

  // TODO: Add an error message if no light was found
  getLight = lightId => {
    return lights.getLight(lightId);
  };

  // This gets triggered if you call setLight
  setLight = light => {
    const { id, state, brightness, color, effect, speed } = light;
    // TODO: add data checking
    // Initialize the payload with it's unique mutationId and the lightId to change
    let payload = { mutationId: this.mutationNumber++, name: id };
    if (state) payload = { ...payload, state };
    if (brightness) payload = { ...payload, brightness };
    if (color) payload = { ...payload, color };
    if (effect) payload = { ...payload, effect };
    if (speed) payload = { ...payload, speed };
    return new Promise((resolve, reject) => {
      // When we get a message from the light, check to see if it had the same mutationId
      // If it did, resolve with the new light's state and remove the event listenet
      const handleMutationResponse = (mutationId, changedLight) => {
        if (mutationId === payload.mutationId) {
          eventEmitter.removeListener(
            "mutationResponse",
            handleMutationResponse
          );
          resolve(changedLight);
        }
      };
      eventEmitter.on("mutationResponse", handleMutationResponse);

      // Publish to the light
      publishTo(
        `${MQTT_LIGHT_TOP_LEVEL}/${id}/${MQTT_LIGHT_COMMAND_TOPIC}`,
        Buffer.from(JSON.stringify(payload))
      );

      // If the response takes too long, error outs
      setTimeout(() => {
        eventEmitter.removeListener("mutationResponse", handleMutationResponse);
        reject(`Response from ${id} took too long to reach the server`);
      }, 3000);
    });
  };

  async addLight(lightId) {
    if (light.getLight(lightId)) {
      ChalkConsole.error(`Error adding ${lightId}: Light already exists`);
      // TODO: return actual graphql error message
      return;
    }

    // TODO: Add light to persistent data storage

    // Add new light to light database
    const lightAdded = light.addLight(lightId);

    // Subscribe to new messages from the new light
    subscribeTo(
      `${MQTT_LIGHT_TOP_LEVEL}/${lightId}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    subscribeTo(`${MQTT_LIGHT_TOP_LEVEL}/${lightId}/${MQTT_LIGHT_STATE_TOPIC}`);
    subscribeTo(`${MQTT_LIGHT_TOP_LEVEL}/${lightId}/${MQTT_EFFECT_LIST_TOPIC}`);

    pubsub.publish("lightAdded", { lightAdded });
    return lightAdded;
  }

  async removeLight(lightId) {
    if (!light.getLight(lightId)) {
      ChalkConsole.error(`Error removing ${lightId}: Light does not exist`);
      // TODO: return actual graphql error message
      return;
    }

    // Remove light from database
    const lightRemoved = light.removeLight(lightId);

    // unsubscribe from the light's messages
    unsubscribeFrom(
      `${MQTT_LIGHT_TOP_LEVEL}/${lightId}/${MQTT_LIGHT_CONNECTED_TOPIC}`
    );
    unsubscribeFrom(
      `${MQTT_LIGHT_TOP_LEVEL}/${lightId}/${MQTT_LIGHT_STATE_TOPIC}`
    );
    unsubscribeFrom(
      `${MQTT_LIGHT_TOP_LEVEL}/${lightId}/${MQTT_EFFECT_LIST_TOPIC}`
    );

    // Return the removed light
    pubsub.publish("lightRemoved", { lightRemoved });
    return lightRemoved;
  }

  // Subscribe to one specific light's changes
  subscribeLight = lightId => {
    return pubsub.asyncIterator(lightId);
  };

  // Subscribe to all light's changes
  subscribeAllLights = lightId => {
    return pubsub.asyncIterator("lightsChanged");
  };

  subscribeLightAdded = lightId => {
    return pubsub.asyncIterator("lightAdded");
  };

  subscribeLightRemoved = lightId => {
    return pubsub.asyncIterator("lightRemoved");
  };

  getLights = () => {
    return light.getAllLights();
  };
}

export default LightConnector;
