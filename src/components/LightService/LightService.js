const { PubSub } = require("apollo-server");
const events = require("events");
const LightDB = require("./LightDB").default;
const LightLink = require("./LightLink").default;
const Debug = require("debug").default;
const { promisify } = require("util");
const { mapConnectionMessageToConnectionPayload } = require("./lightUtil");

const debug = Debug("LightService");

const TIMEOUT_WAIT = 5000;
const asyncSetTimeout = promisify(setTimeout);

class LightService {
  constructor(database, link) {
    // Our mutation number to match each mutation to it's response
    // TODO: Store this in redis
    this.mutationNumber = 0;

    this.isLinked = false;

    this.lightDBClient = database || new LightDB();
    this.lightLink = link || new LightLink();
    // TODO: In order to scale, these need to be passed to the constructor
    this.pubSubClient = new PubSub(); // TODO: Convert this to a redis PubSub
    this.eventEmitter = new events.EventEmitter(); // TODO: instead of this, use the PubSub

    this.initWatchers();
  }

  initWatchers() {
    this.lightLink.onConnect(this.handleLinkLights.bind(this));
    this.lightLink.onDisconnect(this.handleUnlinkLights.bind(this));
    this.lightLink.onConnectionMessage(this.handleConnectedMessage.bind(this));
    this.lightLink.onStateMessage(this.handleStateMessage.bind(this));
    this.lightLink.onEffectListMessage(this.handleEffectListMessage.bind(this));

    this.lightDBClient.onConnect(this.handleLinkLights.bind(this));
  }

  async handleLinkLights() {
    // If we are already linked, return
    if (this.isLinked) return;

    // Get the saved lights from redis
    const { error, lights } = await this.lightDBClient.getAllLights();
    if (error) {
      debug(`Error getting all lights ${error}`);
      return;
    }

    // TODO: If you failed to subscribe to a light, find a way to resubscribe
    // Subscribe to all lights and put their responses into an array
    const subscriptionPromises = lights.map(light =>
      this.lightLink.subscribeToLight(light.id)
    );

    // Wait for all subscriptions to resolve then check for errors
    let didError = false;
    const errors = await Promise.all(subscriptionPromises);
    errors.forEach(error => {
      if (didError) return;
      if (error) {
        debug("Error subscribing to at least one light");
        didError = true;
      }
    });

    if (!didError) this.isLinked = true;
  }

  handleUnlinkLights() {
    debug("unLink Lights");
    this.isLinked = false;
  }

  // This gets triggered when the connection of the light changes
  async handleConnectedMessage(message) {
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

    const { error, light: changedLight } = await this.lightDBClient.setLight(
      message.name,
      {
        connected: connectionPayload
      }
    );
    if (error) {
      debug(error);
      return;
    }

    this.pubSubClient.publish(message.name, { lightChanged: changedLight });
    this.pubSubClient.publish("lightsChanged", {
      lightsChanged: changedLight
    });
  }

  // This gets triggered when the state of the light changes
  async handleStateMessage(message) {
    // TODO: add data checking
    const { mutationId, state, brightness, color, effect, speed } = message;
    let newState = {};
    if (state) newState = { ...newState, state };
    if (brightness) newState = { ...newState, brightness };
    if (color) newState = { ...newState, color };
    if (effect) newState = { ...newState, effect };
    if (speed) newState = { ...newState, speed };

    const { error, light: changedLight } = await this.lightDBClient.setLight(
      message.name,
      newState
    );
    if (error) {
      debug(error);
      return;
    }

    this.pubSubClient.publish(message.name, { lightChanged: changedLight });
    this.pubSubClient.publish("lightsChanged", {
      lightsChanged: changedLight
    });
    // Publish to the mutation response event
    this.eventEmitter.emit("mutationResponse", mutationId, changedLight);
  }

  // This gets triggered when the light sends its effect list
  async handleEffectListMessage(message) {
    const { error, light: changedLight } = await this.lightDBClient.setLight(
      message.name,
      {
        supportedEffects: message.effectList
      }
    );
    if (error) {
      debug(error);
      return;
    }

    this.pubSubClient.publish(message.name, { lightChanged: changedLight });
    this.pubSubClient.publish("lightsChanged", {
      lightsChanged: changedLight
    });
  }

  async getLights() {
    const { error, lights } = await this.lightDBClient.getAllLights();
    return error ? error : lights;
  }

  async getLight(lightId) {
    let error, hasLight, light;

    // If the light was never added, return an error
    ({ error, hasLight } = await this.lightDBClient.hasLight(lightId));
    if (error) return error;
    if (!hasLight) return new Error(`"${lightId}" was not added`);

    // Get the light and return the data
    ({ error, light } = await this.lightDBClient.getLight(lightId));
    return error ? error : light;
  }

  // This gets triggered if you call setLight
  async setLight(light) {
    // Check if the light exists already before doing anything else
    const { error, hasLight } = await this.lightDBClient.hasLight(light.id);
    if (error) return error;
    if (!hasLight) return new Error(`"${light.id}" was never added`);

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
          this.eventEmitter.removeListener(
            "mutationResponse",
            handleMutationResponse
          );

          // Resolve with the light's response data
          resolve(changedLight);
        }
      };

      // Every time we get a new message from the light, check to see if it has the same mutationId
      this.eventEmitter.on("mutationResponse", handleMutationResponse);

      // Publish to the light
      const error = await this.lightLink.publishToLight(id, payload);
      if (error) reject(error);

      // if the response takes too long, error out
      await asyncSetTimeout(TIMEOUT_WAIT);
      this.eventEmitter.removeListener(
        "mutationResponse",
        handleMutationResponse
      );
      reject(new Error(`Response from ${id} timed out`));
    });
  }

  async addLight(lightId) {
    let error, hasLight, lightAdded;

    // Check if the light exists already before doing anything else
    ({ error, hasLight } = await this.lightDBClient.hasLight(lightId));
    if (error) return error;
    if (hasLight) return new Error(`"${lightId}" is already added`);

    // Add new light to light database
    ({ error, light: lightAdded } = await this.lightDBClient.addLight(lightId));
    if (error) return error;

    // Subscribe to new messages from the new light
    // TODO: put light in a queue to resubscribe when MQTT is connected
    error = await this.lightLink.subscribeToLight(lightId);
    if (error) debug(`Failed to subscribe to ${lightId}\n${error}`);

    // TODO: Find a way to check if the light is connected
    // If it is connected, return then.
    // Wait a max of .5 seconds?
    this.pubSubClient.publish("lightAdded", { lightAdded });
    return lightAdded;
  }

  async removeLight(lightId) {
    let error, hasLight, lightRemoved;

    // Check if the light exists already before doing anything else
    ({ error, hasLight } = await this.lightDBClient.hasLight(lightId));
    if (error) return error;
    if (!hasLight) return new Error(`"${lightId}" was already removed`);

    // unsubscribe from the light's messages
    error = await this.lightLink.unsubscribeFromLight(lightId);
    if (error) {
      debug(`Could not unsubscribe from ${lightId}`);
      return new Error(`Could not unsubscribe from ${lightId}`);
    }

    // TODO: Add cleanup here in case we only remove part of the light from redis
    // TODO: Figure out if we should resubscribe to the light if it wasn't completely removed
    // Remove light from database
    ({
      error,
      lightRemoved
    } = lightRemoved = await this.lightDBClient.removeLight(lightId));
    if (error) return error;

    // Return the removed light
    this.pubSubClient.publish("lightRemoved", { lightRemoved });
    return lightRemoved;
  }

  // Subscribe to one specific light's changes
  subscribeToLight(lightId) {
    return this.pubSubClient.asyncIterator(lightId);
  }

  // Subscribe to all light's changes
  subscribeToAllLights() {
    return this.pubSubClient.asyncIterator("lightsChanged");
  }

  subscribeToLightsAdded() {
    return this.pubSubClient.asyncIterator("lightAdded");
  }

  subscribeToLightsRemoved() {
    return this.pubSubClient.asyncIterator("lightRemoved");
  }
}

module.exports = { default: LightService };
