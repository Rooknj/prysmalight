const { execSync } = require("child_process");

try {
  execSync("redis-cli flushall");
} catch (error) {
  console.log("Redis is not connected")
}
execSync("rm -rf build");
execSync("docker-compose down");
