const redis = require("redis");

const connect = (options, mediator) => {
  mediator.once("boot.ready", () => {
    const db = redis.createClient(options.port, options.host);
    mediator.emit("db.ready", db);
    //mediator.emit('db.error', err)
  });
};

module.exports = Object.assign({}, { connect });
