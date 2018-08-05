const { execSync } = require("child_process");
const rimraf = require("rimraf");

// Clear redis database
try {
  execSync("redis-cli flushall", { timeout: 2000 });
} catch (error) {
  console.log("Redis is not connected");
}

// Remove build folder
rimraf("build", function(error) {
  if(error) console.log("Error on rimraf: ", error);
});

// Bring down docker containers
execSync("docker-compose down");
