const createDiscoveryService = (mediator, mqttClient) => {
  let self;

  const start = () => {
    console.log("Start Discovery");
  };

  const stop = () => {
    console.log("Stop Discovery");
  };

  const getDiscoveredLights = () => {};

  self = { start, stop, getDiscoveredLights };

  return Object.assign({}, self);
};

module.exports = { createDiscoveryService };
