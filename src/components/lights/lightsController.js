import ChalkConsole from "../../ChalkConsole";
import MQTT from "async-mqtt";
import { PubSub } from "graphql-subscriptions";
import events from "events";

import Light from "./light";
import LightMqttDAL from "./lightMqttDAL";

const light = new Light();
const mqttDAL = new LightMqttDAL();

// Instantiate the eventEmitter
const eventEmitter = new events.EventEmitter();

// Initialize PubSub
const pubsub = new PubSub();

// MQTT: payloads by default
const LIGHT_CONNECTED = 2;
const LIGHT_DISCONNECTED = 0;

class LightConnector {
  constructor() {
    // Our mutation number to match each mutation to it's response
    this.mutationNumber = 0;
    // Start the initialize function
    this.init();
  }

  async init() {
    // Set up onConnect callback
    mqttDAL.onConnect(() => {
      ChalkConsole.info(`Connected to MQTT broker`);
      light.getAllLights().forEach(light => mqttDAL.subscribeToLight(light.id));
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

    mqttDAL.onConnectionMessage(handleConnectedMessage);
    mqttDAL.onEffectListMessage(handleEffectListMessage);
    mqttDAL.onStateMessage(handleStateMessage);
  }

  // TODO: Add an error message if no light was found
  getLight = lightId => {
    return lights.getLight(lightId);
  };

  // This gets triggered if you call setLight
  setLight = light => {
    const { id, state, brightness, color, effect, speed } = light;

    // Initialize the MQTT payload with it's unique mutationId and the id of the light to change
    let payload = { mutationId: this.mutationNumber++, name: id };
    if (state) payload = { ...payload, state };
    if (brightness) payload = { ...payload, brightness };
    if (color) payload = { ...payload, color };
    if (effect) payload = { ...payload, effect };
    if (speed) payload = { ...payload, speed };

    // Return a promise which resolves when the light responds to this message
    return new Promise((resolve, reject) => {
      const handleMutationResponse = (mutationId, changedLight) => {
        // If the mutationId on the light's response matches the mutationId we sent on this mutation
        if (mutationId === payload.mutationId) {
          // Remove this mutation's event listener
          eventEmitter.removeListener(
            "mutationResponse",
            handleMutationResponse
          );

          // Set the light in our data store
          light.setLight(changedLight);

          // Resolve with the light's response data
          resolve(changedLight);
        }
      };

      // Every time we get a new message from the light, check to see if it has the same mutationId
      eventEmitter.on("mutationResponse", handleMutationResponse);

      // Publish to the light
      mqttDAL.publishToLight(id, payload);

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
    mqttDAL.subscribeToLight(lightId);

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
    mqttDAL.unsubscribeFromLight(lightId);

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
