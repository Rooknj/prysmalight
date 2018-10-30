const MQTT = require("async-mqtt");

const connect = (options, mediator) => {
  mediator.once("boot.ready", () => {
    const pubsub = MQTT.connect(
      options.host,
      {
        reconnectPeriod: options.reconnectPeriod, // Amount of time between reconnection attempts
        username: options.username,
        password: options.password
      }
    );
    mediator.emit("pubsub.ready", pubsub);
    //mediator.emit('db.error', err)
  });
};

module.exports = Object.assign({}, { connect });
