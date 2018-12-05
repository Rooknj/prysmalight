const Debug = require("debug").default;
const debug = Debug("repository");
const { promisify } = require("util");
const asyncSetTimeout = promisify(setTimeout);

// TODO: Move this to be a dependency
const { PubSub } = require("apollo-server");
const pubSubClient = new PubSub();

const repo = connection => {
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

  const getLight = () => mockLight;
  const getLights = () => [mockLight, mockLight, mockLight];
  const setLight = () => mockLight;
  const addLight = () => mockLight;
  const removeLight = () => mockLight;
  const subscribeToLight = () => pubSubClient.asyncIterator("test1");
  const subscribeToAllLights = () => pubSubClient.asyncIterator("test2");
  const subscribeToLightsAdded = () => pubSubClient.asyncIterator("test3");
  const subscribeToLightsRemoved = () => pubSubClient.asyncIterator("test4");

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
const connect = async (amqp, amqpSettings) => {
  // Validate the input
  if (!amqp) return { error: new Error("You must provide an amqp library") };
  if (!amqpSettings)
    return { error: new Error("You must provide amqp connection settings") };

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
      return repo(connection);
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
