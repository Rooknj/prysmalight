const dbFactory = require("./dbFactory");
const pubsubFactory = require("./pubsubFactory");
const Debug = require("debug").default;
const debug = Debug("repo");

//TODO: Include this stuff in deps
const { PubSub } = require("apollo-server");
const badPubSub = new PubSub();

const mockLight = {
  id: "Fake Light 1",
  connected: true,
  state: "ON",
  brightness: 72,
  color: { r: 0, g: 127, b: 255 },
  effect: "None",
  speed: 3,
  supportedEffects: ["Effect 1", "Effect 2", "Effect 3"]
};

module.exports = ({ dbClient, pubsubClient }) => {
  const db = dbFactory(dbClient);
  const pubsub = pubsubFactory(pubsubClient);

  db.connections.subscribe(() => debug("db client connected"));
  db.disconnections.subscribe(() => console.log("db client disconnected"));
  pubsub.connections.subscribe(() => {
    debug("pubsub client connected");
    setTimeout(() => pubsub.subscribeToLight("Default Mock"), 3000);
  });
  pubsub.disconnections.subscribe(() =>
    console.log("pubsub client disconnected")
  );
  pubsub.messages.subscribe(message =>
    console.log("pubsub client got message", message)
  );

  const getLight = () => mockLight;
  const getLights = () => [mockLight, mockLight, mockLight];
  const setLight = () => mockLight;
  const addLight = () => mockLight;
  const removeLight = () => mockLight;
  const subscribeToLight = () => badPubSub.asyncIterator("test1");
  const subscribeToAllLights = () => badPubSub.asyncIterator("test2");
  const subscribeToLightsAdded = () => badPubSub.asyncIterator("test3");
  const subscribeToLightsRemoved = () => badPubSub.asyncIterator("test4");

  return Object.create({
    getLight,
    getLights,
    setLight,
    addLight,
    removeLight,
    subscribeToLight,
    subscribeToAllLights,
    subscribeToLightsAdded,
    subscribeToLightsRemoved
  });
};
