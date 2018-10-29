//const {EventEmitter} = require('events')
const server = require("./server/server");
//const repository = require('./repository/repository')
//const config = require('./config/')
//const mediator = new EventEmitter()

console.log("--- Light Service ---");
//console.log('Connecting to movies repository...')

process.on("uncaughtException", err => {
  console.error("Unhandled Exception", err);
});

process.on("uncaughtRejection", (err, promise) => {
  console.error("Unhandled Rejection", err);
});

const GRAPHQL_PORT = 4001; // Default Server Port

server
  .start({
    port: GRAPHQL_PORT
  })
  .then(app => {
    app.on("close", () => {
      console.log("App Closed");
    });
  });

//mediator.emit('boot.ready')
