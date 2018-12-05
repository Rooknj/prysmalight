const Debug = require("debug").default;
const debug = Debug("config");

const serverSettings = {
  port: process.env.PORT || 4001
};

const rabbitSettings = {
  host: process.env.RABBIT_HOST || "amqp://raspberrypi.local"
};

module.exports = Object.assign({}, { serverSettings, rabbitSettings });
