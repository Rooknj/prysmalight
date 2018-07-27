import { PubSub } from "graphql-subscriptions";
import events from "events";
import LightDB from "./LightDB";
import LightLink from "./LightLink";
import Debug from "debug";
import { promisify } from "util";

const debug = Debug("LightService");

const TIMEOUT_WAIT = 5000;
const asyncSetTimeout = promisify(setTimeout);

const eventEmitter = new events.EventEmitter();
const pubsub = new PubSub();
const lightDB = new LightDB();
const lightLink = new LightLink();

// MQTT: payloads by default
const LIGHT_CONNECTED = 2;
const LIGHT_DISCONNECTED = 0;

// Utility functions
const mapConnectionMessageToConnectionPayload = connectionMessage => {
  let connectionString = -1;
  if (Number(connectionMessage) === LIGHT_DISCONNECTED) {
    connectionString = LIGHT_DISCONNECTED;
  } else if (Number(connectionMessage) === LIGHT_CONNECTED) {
    connectionString = LIGHT_CONNECTED;
  }
  return connectionString;
};

class LightService {
  constructor() {
    // Our mutation number to match each mutation to it's response
    // TODO: Store this in redis
    this.mutationNumber = 0;
    // Start the initialize function
    this.init();
  }

  async init() {
    // Set up onConnect callback
    lightLink.onConnect(async () => {
      debug(`Connected to MQTT broker`);

      // Get the saved lights from redis
      const { error, lights } = await lightDB.getAllLights();
      if (error) {
        debug(`Error getting all lights ${error}`);
        return;
      }

      // TODO: If you failed to subscribe to a light, find a way to resubscribe
      lights.forEach(light => {
        const error = lightLink.subscribeToLight(light.id);
        if (error) {
          debug(`could not subscribe to "${light}". Error: ${error}`);
        }
      });
    });

    // This gets triggered when the connection of the light changes
    const handleConnectedMessage = async message => {
      // If the connectionPayload isn't correct, return
      const connectionPayload = mapConnectionMessageToConnectionPayload(
        message.connection
      );
      if (connectionPayload === -1) {
        debug(
          `Received messsage on connected topic that was not in the correct format. Ignoring\nMessage: ${message}`
        );
        return;
      }

      const { error, light: changedLight } = await lightDB.setLight(
        message.name,
        {
          connected: connectionPayload
        }
      );
      if (error) {
        debug(error);
        return;
      }

      pubsub.publish(message.name, { lightChanged: changedLight });
      pubsub.publish("lightsChanged", { lightsChanged: changedLight });
    };

    // This gets triggered when the state of the light changes
    const handleStateMessage = async message => {
      // TODO: add data checking
      const { mutationId, state, brightness, color, effect, speed } = message;
      let newState = {};
      if (state) newState = { ...newState, state };
      if (brightness) newState = { ...newState, brightness };
      if (color) newState = { ...newState, color };
      if (effect) newState = { ...newState, effect };
      if (speed) newState = { ...newState, speed };

      const { error, light: changedLight } = await lightDB.setLight(
        message.name,
        newState
      );
      if (error) {
        debug(error);
        return;
      }

      pubsub.publish(message.name, { lightChanged: changedLight });
      pubsub.publish("lightsChanged", { lightsChanged: changedLight });
      // Publish to the mutation response event
      eventEmitter.emit("mutationResponse", mutationId, changedLight);
    };

    // This gets triggered when the light sends its effect list
    const handleEffectListMessage = async message => {
      const { error, light: changedLight } = await lightDB.setLight(
        message.name,
        {
          supportedEffects: message.effectList
        }
      );
      if (error) {
        debug(error);
        return;
      }

      pubsub.publish(message.name, { lightChanged: changedLight });
      pubsub.publish("lightsChanged", { lightsChanged: changedLight });
    };

    lightLink.onConnectionMessage(handleConnectedMessage);
    lightLink.onStateMessage(handleStateMessage);
    lightLink.onEffectListMessage(handleEffectListMessage);
  }

  async getLights() {
    const { error, lights } = await lightDB.getAllLights();
    return error ? error : lights;
  }

  async getLight(lightId) {
    let error, hasLight, light;

    // If the light was never added, return an error
    ({ error, hasLight } = await lightDB.hasLight(lightId));
    if (error) return error;
    if (!hasLight) return new Error(`"${lightId}" was not added`);

    // Get the light and return the data
    ({ error, light } = await lightDB.getLight(lightId));
    return error ? error : light;
  }

  // This gets triggered if you call setLight
  setLight(light) {
    // TODO: Is this really the best way to handle this?
    if (!lightDB.isConnected) {
      return new Error("Can't set light. Not connected to redis");
    }

    // Initialize the MQTT payload with it's unique mutationId and the id of the light to change
    const { id, state, brightness, color, effect, speed } = light;
    let payload = { mutationId: this.mutationNumber++, name: id };
    if (state) payload = { ...payload, state };
    if (brightness) payload = { ...payload, brightness };
    if (color) payload = { ...payload, color };
    if (effect) payload = { ...payload, effect };
    if (speed) payload = { ...payload, speed };

    // Return a promise which resolves when the light responds to this message or rejects if it takes too long
    return new Promise(async (resolve, reject) => {
      const handleMutationResponse = (mutationId, changedLight) => {
        if (mutationId === payload.mutationId) {
          // Remove this mutation's event listener
          eventEmitter.removeListener(
            "mutationResponse",
            handleMutationResponse
          );

          // Resolve with the light's response data
          resolve(changedLight);
        }
      };

      // Every time we get a new message from the light, check to see if it has the same mutationId
      eventEmitter.on("mutationResponse", handleMutationResponse);

      // Publish to the light
      const error = await lightLink.publishToLight(id, payload);
      if (error) reject(error);

      // if the response takes too long, error out
      await asyncSetTimeout(TIMEOUT_WAIT);
      eventEmitter.removeListener("mutationResponse", handleMutationResponse);
      reject(new Error(`Response from ${id} timed out`));
    });
  }

  async addLight(lightId) {
    let error, hasLight, lightAdded;

    // Check if the light exists already before doing anything else
    ({ error, hasLight } = await lightDB.hasLight(lightId));
    if (error) return error;
    if (hasLight) return new Error(`"${lightId}" is already added`);

    // Add new light to light database
    ({ error, light: lightAdded } = await lightDB.addLight(lightId));
    if (error) return error;

    // Subscribe to new messages from the new light
    // TODO: put light in a queue to resubscribe when MQTT is connected
    error = await lightLink.subscribeToLight(lightId);
    if (error) debug(`Failed to subscribe to ${lightId}\n${error}`);

    // TODO: Find a way to check if the light is connected
    // If it is connected, return then.
    // Wait a max of .5 seconds?
    pubsub.publish("lightAdded", { lightAdded });
    return lightAdded;
  }

  async removeLight(lightId) {
    let error, hasLight, lightRemoved;

    // Check if the light exists already before doing anything else
    ({ error, hasLight } = await lightDB.hasLight(lightId));
    if (error) return error;
    if (!hasLight) return new Error(`"${lightId}" was already removed`);

    // unsubscribe from the light's messages
    error = await lightLink.unsubscribeFromLight(lightId);
    if (error) {
      debug(`Could not unsubscribe from ${lightId}`);
      return new Error(`Could not unsubscribe from ${lightId}`);
    }

    // TODO: Add cleanup here in case we only remove part of the light from redis
    // TODO: Figure out if we should resubscribe to the light if it wasn't completely removed
    // Remove light from database
    ({ error, light: lightRemoved } = lightRemoved = await lightDB.removeLight(
      lightId
    ));
    if (error) return error;

    // Return the removed light
    pubsub.publish("lightRemoved", { lightRemoved });
    return lightRemoved;
  }

  // Subscribe to one specific light's changes
  subscribeLight(lightId) {
    return pubsub.asyncIterator(lightId);
  }

  // Subscribe to all light's changes
  subscribeAllLights() {
    return pubsub.asyncIterator("lightsChanged");
  }

  subscribeLightAdded() {
    return pubsub.asyncIterator("lightAdded");
  }

  subscribeLightRemoved() {
    return pubsub.asyncIterator("lightRemoved");
  }
}

export default LightService;
