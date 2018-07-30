// Returns an array of objects in the shape of:
// node -x hey -y cool chocolatey crackers =>
// {_: [chocolatey, crackers], x: hey, y: cool}
const parseArgs = require("minimist");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const DEBUG_OPTIONS = "";

const displayUsage = () => {
  console.log(`
Usage: start [...options]

A script to start lightapp2-client

Options:
  -h, --help          Display usage
      --local         Use the local MQTT server
      --mock          Use local MQTT server and start mock lights
    `);
};

// Start redis
const startRedis = () => {

}

// Start MQTT Broker
const startMQTT = () => {

}

startServer = env => {
  
}

// Process all command line arguments
const processArgs = args => {
  // Display usage and exit if -h flag is set
  if (args.h) {
    displayUsage();
    return;
  }

  startRedis();

  if(args.mock) {
    startMQTT();
  }

  if (args.local) {
    startMQTT();
  }

};

const args = parseArgs(process.argv.slice(2));
processArgs(args);
