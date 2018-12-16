const { execSync } = require("child_process");
const rimraf = require("rimraf");
const { promisify } = require("util");
const config = require("../src/config/config");
const redis = require("redis");
const redisClient = redis.createClient(
  config.redisSettings.port,
  config.redisSettings.host
);

// If redis fails to connect, just quit all connection attempts
redisClient.on("error", () => {
  redisClient.quit();
});

const clean = async () => {
  const asyncFLUSHALL = promisify(redisClient.FLUSHALL).bind(redisClient);

  // Clear redis database
  try {
    const reply = await asyncFLUSHALL();
    console.log("Successfully cleared redis", reply);
  } catch (error) {
    console.log("Did not clear redis");
  }

  // Remove build folder
  rimraf("build", function(error) {
    if (error) {
      console.log("Error removing build folder: ", error);
    } else {
      console.log("Successfully removed build folder");
    }
  });

  // Bring down docker containers
  console.log("Bringing docker containers down");
  execSync("docker-compose down");

  // End redis connection
  redisClient.quit();
};

clean();
