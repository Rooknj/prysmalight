const discovery = require("./discovery");

const start = deps => {
  const { mqttClient } = deps;
  discovery.start(mqttClient);
};

module.exports = { start };
