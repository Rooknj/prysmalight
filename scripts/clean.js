const { execSync } = require("child_process");
const rimraf = require("rimraf");

const clean = async () => {
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
};

clean();
