const { createDiscoveryService } = require("./discovery");

const start = deps => {
  const { mqttClient, mediator } = deps;
  const discoveryService = createDiscoveryService(mediator, mqttClient);
  discoveryService.start();
};

module.exports = { start };
