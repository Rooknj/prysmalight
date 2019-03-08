const Debug = require("debug").default;
const debug = Debug("repo");

const {
  GET_LIGHT,
  GET_LIGHTS,
  SET_LIGHT,
  ADD_LIGHT,
  REMOVE_LIGHT,
  LIGHT_ADDED,
  LIGHT_REMOVED,
  LIGHT_CHANGED,
  GET_DISCOVERED_LIGHTS
} = require("../eventConstants");

// TODO: Switch this to getRandomId
// const generateRandomId = () =>
//   new Date().getTime().toString() +
//   Math.random().toString() +
//   Math.random().toString();
let mutationNumber = 0;

const { promisify } = require("util");
const TIMEOUT_WAIT = 5000;
const asyncSetTimeout = promisify(setTimeout);

module.exports = ({ mediator, db, pubsub }) => {
  let self = {};

  const init = () => {
    // Start listening to the messages
    pubsub.connectMessages.subscribe(self.handleConnectMessage);
    pubsub.stateMessages.subscribe(self.handleStateMessage);
    pubsub.effectMessages.subscribe(self.handleEffectListMessage);
    pubsub.startDiscovery();

    // Subscribe to all lights on startup
    db.connections.subscribe(self.connect);
    pubsub.connections.subscribe(self.connect);
    pubsub.disconnections.subscribe(() => (self.connected = false));
    db.disconnections.subscribe(() => (self.connected = false));

    // Listen for RPC messages
    mediator.onRpcMessage(GET_LIGHT, ({ lightId }) => self.getLight(lightId));
    mediator.onRpcMessage(GET_LIGHTS, () => self.getLights());
    mediator.onRpcMessage(SET_LIGHT, ({ lightId, lightData }) =>
      self.setLight(lightId, lightData)
    );
    mediator.onRpcMessage(ADD_LIGHT, ({ lightId }) => self.addLight(lightId));
    mediator.onRpcMessage(REMOVE_LIGHT, ({ lightId }) =>
      self.removeLight(lightId)
    );
    mediator.onRpcMessage(GET_DISCOVERED_LIGHTS, () =>
      self.getDiscoveredLights()
    );
  };

  /**
   * Attempts to subscribe to all added lights
   * Sets the self.connected property to true if successful
   */
  const connect = async () => {
    if (!pubsub.connected) {
      debug("Cant connect repo, pubsub not connected");
      return new Error("pubsub not connected");
    }
    if (!db.connected) {
      debug("Cant connect repo, db not connected");
      return new Error("db not connected");
    }

    // Get the saved lights from redis
    const { error, lights } = await db.getAllLights();
    if (error) {
      debug(`Error getting all lights during subscribeToAllLights ${error}`);
      return error;
    }

    // TODO: If you failed to subscribe to a light, find a way to resubscribe
    // Subscribe to all lights and put their responses into an array
    const subscriptionPromises = lights.map(light =>
      pubsub.subscribeToLight(light.id)
    );

    // Wait for all subscriptions to resolve then check for errors
    const errors = await Promise.all(subscriptionPromises);
    let subscriptionError = null;
    errors.forEach(error => {
      if (subscriptionError) return;
      if (error) {
        debug(error);
        subscriptionError = error;
      }
    });

    if (subscriptionError) return subscriptionError;
    // Set connection status to true if there were no errors
    debug(`Successfully Connected to Repo`);
    self.connected = true;
    return null;
  };

  /**
   * Updates the db with the connect message data
   * Will ignore messages not in the correct format.
   * @param {object} message - the connect status message of a light
   */
  const handleConnectMessage = async message => {
    if (!message.name) {
      debug("No name in the connect message");
      return new Error("No name supplied from the message");
    }

    // Validate the message is in the correct format
    const LIGHT_CONNECTED = 2;
    const LIGHT_DISCONNECTED = 0;
    let connection = Number(message.connection);
    if (connection !== LIGHT_DISCONNECTED && connection !== LIGHT_CONNECTED) {
      debug(`Incorrect connection format: ignoring\nMessage: ${message}`);
      return new Error("Incorrect connection format");
    }

    let error, changedLight;

    // Update the light's connection data in the db
    error = await db.setLight(message.name, {
      connected: connection
    });
    if (error) {
      debug(error);
      return error;
    }

    ({ error, light: changedLight } = await db.getLight(message.name));
    if (error) {
      debug(error);
      return error;
    }

    mediator.publish("lightChanged", { lightChanged: changedLight });
    return null;
  };

  /**
   * Updates the db with the state message data
   * Will also notify setLight that the light sent a response.
   * @param {object} message - the state message of a light
   */
  const handleStateMessage = async message => {
    if (!message.name) {
      debug("No name in the state message");
      return new Error("No name supplied from the message");
    }
    // Parse the message and generate a newState object
    // TODO: add data checking
    const { mutationId, state, brightness, color, effect, speed } = message;
    let newState = {};
    if (state) newState = { ...newState, state };
    if (brightness) newState = { ...newState, brightness };
    if (color) newState = { ...newState, color };
    if (effect) newState = { ...newState, effect };
    if (speed) newState = { ...newState, speed };

    // If nothing was added to newState, that means the message was irrelavent data
    if (Object.keys(newState).length <= 0)
      return new Error("Message had irrelevant data");

    let error, changedLight;
    // Update the light's state data in the db
    error = await db.setLight(message.name, newState);
    if (error) {
      debug(error);
      return error;
    }

    ({ error, light: changedLight } = await db.getLight(message.name));
    if (error) {
      debug(error);
      return error;
    }

    // Notify setLight of the light's response
    mediator.publish("mutationResponse", { mutationId, changedLight });
    mediator.publish(LIGHT_CHANGED, { lightChanged: changedLight });
    return null;
  };

  /**
   *
   * @param {object} message - the effect list message of a light
   */
  const handleEffectListMessage = async message => {
    if (!message.name) {
      debug("No name in the effect list message");
      return new Error("No name supplied from the message");
    }

    let error, changedLight;

    if (!Array.isArray(message.effectList)) {
      debug("No effect list supplied in message");
      return new Error("No effect list supplied in message");
    }
    // Update the light's effect list in the db
    error = await db.setLight(message.name, {
      supportedEffects: message.effectList
    });
    if (error) {
      debug(error);
      return error;
    }

    ({ error, light: changedLight } = await db.getLight(message.name));
    if (error) {
      debug(error);
      return error;
    }

    mediator.publish(LIGHT_CHANGED, { lightChanged: changedLight });
    return null;
  };

  /**
   * Get the light with the specified id from the db.
   * Will return an error of the light was not added.
   * @param {string} lightId
   */
  const getLight = async lightId => {
    let error, hasLight, light;

    // If the light was never added, return an error
    ({ error, hasLight } = await db.hasLight(lightId));
    if (error) return error;
    if (!hasLight) return new Error(`"${lightId}" is not currently added`);

    // Get the light and return the data
    ({ error, light } = await db.getLight(lightId));
    return error ? error : light;
  };

  /**
   * Get all lights currently added to the db.
   */
  const getLights = async () => {
    const { error, lights } = await db.getAllLights();
    return error ? error : lights;
  };

  /**
   * Add the light to the db and subscribe to it's changes.
   * Will return an error if the light was already added.
   * @param {string} lightId
   */
  const addLight = async lightId => {
    let error, hasLight;

    // If the light was already added, return an error
    ({ error, hasLight } = await db.hasLight(lightId));
    if (error) return error;
    if (hasLight)
      return new Error(`The light with id (${lightId}) was already added`);

    // Add new light to light database
    error = await db.addLight(lightId);
    if (error) return error;

    // Subscribe to new messages from the new light
    error = await pubsub.subscribeToLight(lightId);
    if (error) debug(`Failed to subscribe to ${lightId}\n${error}`);

    // Get the newly added light and return it
    const lightAdded = await self.getLight(lightId);
    mediator.publish(LIGHT_ADDED, {
      lightAdded
    });
    return lightAdded;
  };

  /**
   * Remove the light with the specified id from the db and unsubscribe from it's changes.
   * Will return an error if the light is not currently added.
   * Only returns an object containing the light's id.
   * @param {string} lightId
   */
  const removeLight = async lightId => {
    let error, hasLight;

    // Check if the light exists already before doing anything else
    ({ error, hasLight } = await db.hasLight(lightId));
    if (error) return error;
    if (!hasLight) return new Error(`"${lightId}" is not currently added`);

    // Unsubscribe from the light's messages
    error = await pubsub.unsubscribeFromLight(lightId);
    if (error) {
      debug(`Could not unsubscribe from ${lightId}`);
      return new Error(`Could not unsubscribe from ${lightId}`);
    }

    // TODO: Add cleanup here in case we only remove part of the light from redis
    // TODO: Figure out if we should resubscribe to the light if it wasn't completely removed
    // Remove light from database
    error = await db.removeLight(lightId);
    if (error) return error;

    const lightRemoved = lightId;

    mediator.publish(LIGHT_REMOVED, { lightRemoved });
    // Return the removed light's id
    return lightRemoved;
  };

  /**
   * Sends a message to the specified light with a list of state changes.
   * @param {Object} light
   */
  const setLight = async (lightId, lightData) => {
    const id = lightId;
    // Check if the light exists already before doing anything else
    const { error, hasLight } = await db.hasLight(id);
    if (error) return error;
    if (!hasLight) return new Error(`"${id}" was never added`);

    // Create the command payload
    const { state, brightness, color, effect, speed } = lightData;
    let payload = { mutationId: mutationNumber++, name: id };
    if (state) payload = { ...payload, state };
    if (brightness) payload = { ...payload, brightness };
    if (color) payload = { ...payload, color };
    if (effect) payload = { ...payload, effect };
    if (speed) payload = { ...payload, speed };

    // Return a promise which resolves when the light responds to this message or rejects if it takes too long
    return new Promise(async (resolve, reject) => {
      const handleMutationResponse = ({ mutationId, changedLight }) => {
        if (mutationId === payload.mutationId) {
          // Remove this mutation's event listener
          mediator.unsubscribe("mutationResponse", handleMutationResponse);

          // Resolve with the light's response data
          resolve(changedLight);
        }
      };

      // Every time we get a new message from the light, check to see if it has the same mutationId
      mediator.subscribe("mutationResponse", handleMutationResponse);

      // Publish to the light
      const error = await pubsub.publishToLight(id, payload);
      if (error) reject(error);

      // if the response takes too long, error out
      await asyncSetTimeout(TIMEOUT_WAIT);
      mediator.unsubscribe("mutationResponse", handleMutationResponse);
      reject(new Error(`Response from ${id} timed out`));
    });
  };

  const getDiscoveredLights = async () => {
    const lights = [];
    const onLightDiscovered = async msg => {
      const { name, ipAddress, macAddress, numLeds, udpPort } = msg;
      const { error, hasLight } = await db.hasLight(name);
      if (error) return error;

      if (!lights.find(light => light.id === name) && !hasLight) {
        lights.push({ id: name, ipAddress, macAddress, numLeds, udpPort });
      }
    };
    mediator.subscribe("lightDiscovered", onLightDiscovered);
    pubsub.publishDiscoveryMessage();

    await asyncSetTimeout(500);

    return lights;
  };

  self = {
    connected: false,
    init,
    connect,
    handleConnectMessage,
    handleStateMessage,
    handleEffectListMessage,
    getLight,
    getLights,
    setLight,
    addLight,
    removeLight,
    getDiscoveredLights
  };

  return Object.create(self);
};
