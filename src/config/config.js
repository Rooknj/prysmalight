const Debug = require("debug").default;
const debug = Debug("config");

const serverSettings = {
  port: process.env.PORT || 4001
};

const rabbitSettings = {
  protocol: "amqp",
  hostname: process.env.RABBIT_HOST || "raspberrypi.local",
  port: 5672,
  username: "guest",
  password: "guest",
  locale: "en_US",
  frameMax: 0,
  heartbeat: 0,
  vhost: "/"
};

module.exports = Object.assign({}, { serverSettings, rabbitSettings });
