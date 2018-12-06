const Debug = require("debug").default;
const debug = Debug("repository");
const { promisify } = require("util");
const asyncSetTimeout = promisify(setTimeout);

const ALL_LIGHTS_SUBSCRIPTION_TOPIC = "lightsChanged";
const LIGHT_ADDED_SUBSCRIPTION_TOPIC = "lightAdded";
const LIGHT_REMOVED_SUBSCRIPTION_TOPIC = "lightRemoved";

// TODO: Move this to be a dependency
const repo = ({ connection, gqlPubSub }) => {
  let self = {};

  const mockLight = {
    id: "Mock Service Light 1",
    connected: true,
    state: "ON",
    brightness: 72,
    color: { r: 0, g: 127, b: 255 },
    effect: "None",
    speed: 3,
    supportedEffects: ["Effect 1", "Effect 2", "Effect 3"]
  };

  const getLight = lightId => mockLight;
  const getLights = () => [mockLight, mockLight, mockLight];
  const setLight = (lightId, lightData) => mockLight;
  const addLight = lightId => {
    gqlPubSub.publish("lightAdded", { lightAdded: { id: lightId } });
    return mockLight;
  };
  const removeLight = lightId => mockLight;
  /**
   * Subscribes to the changes of a specific light.
   * @param {string} lightId
   */
  const subscribeToLight = lightId => gqlPubSub.asyncIterator(lightId);

  /**
   * Subscribes to the changes of all lights.
   */
  const subscribeToAllLights = () =>
    gqlPubSub.asyncIterator(ALL_LIGHTS_SUBSCRIPTION_TOPIC);

  /**
   * Subscribes to lights being added.
   */
  const subscribeToLightsAdded = () =>
    gqlPubSub.asyncIterator(LIGHT_ADDED_SUBSCRIPTION_TOPIC);

  /**
   * Subscribes to lights being removed.
   */
  const subscribeToLightsRemoved = () =>
    gqlPubSub.asyncIterator(LIGHT_REMOVED_SUBSCRIPTION_TOPIC);

  self = {
    getLight,
    getLights,
    setLight,
    addLight,
    removeLight,
    subscribeToLight,
    subscribeToAllLights,
    subscribeToLightsAdded,
    subscribeToLightsRemoved
  };

  return Object.create(self);
};

// Connect to rabbitMQ then pass that connection to the repo factory
const connect = async ({ amqp, amqpSettings, gqlPubSub }) => {
  // Validate the input
  if (!amqp)
    return { error: new Error("You must provide an amqp library"), repo: null };
  if (!amqpSettings)
    return {
      error: new Error("You must provide amqp connection settings"),
      repo: null
    };

  // Attempt to connect to rabbitMQ until successful
  const RETRY_DELAY = 5; // Retry delay in seconds
  let attemptNumber = 0,
    connected = false;
  while (!connected) {
    try {
      // Attempt the connection
      attemptNumber += 1;
      debug(`Attempt ${attemptNumber} to connect to rabbitMQ...`);
      const connection = await amqp.connect(amqpSettings);

      // Once the server is forced to close, close the rabbitMQ connection
      process.once("SIGINT", connection.close.bind(connection));
      debug(`Connected to rabbitMQ after ${attemptNumber} attempts.`);

      // Pass the connection to the repo factory
      return { error: null, repo: repo({ connection, gqlPubSub }) };
    } catch (err) {
      debug(
        `Error connecting to rabbitMQ. Retrying in ${RETRY_DELAY} seconds...`
      );

      // If it fails, wait for a time before retrying
      await asyncSetTimeout(RETRY_DELAY * 1000);
    }
  }
};

module.exports = connect;
