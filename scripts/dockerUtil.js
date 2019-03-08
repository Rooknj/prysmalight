const parseArgs = require("minimist");
const spawn = require("cross-spawn");

const IMAGE_NAME = "rooknj/prysmalight";

const getDockerImage = tag => {
  let dockerTag = tag;
  if (process.env.TRAVIS) {
    console.log("In CI");
    const branchName = process.env.TRAVIS_BRANCH;
    if (branchName) {
      if (branchName === "master") {
        dockerTag = "latest";
      } else {
        dockerTag = "test";
      }
    }
  }
  return `${IMAGE_NAME}:${dockerTag}`;
};

const buildDockerImage = async tag => {
  const image = getDockerImage(tag);
  console.log("Building", image);
  const child = spawn("docker", ["build", "-t", image, "."], {
    stdio: ["inherit", "inherit", "inherit"],
    cwd: process.cwd(),
    env: process.env
  });
  child.on("error", err => console.log("Error:", err))
  child.on("exit", (code, signal) => console.log("Exit:", code, signal))
};

const publishDockerImage = async tag => {
  const image = getDockerImage(tag);
  console.log("Publishing", image);
  spawn("docker", ["push", image], {
    stdio: ["inherit", "inherit", "inherit"],
    cwd: process.cwd(),
    env: process.env
  });
};

// Process all command line arguments
const processArgs = async args => {
  // a tag is required if not in CI
  if (!args.t && !process.env.TRAVIS) {
    console.log("Not in CI and no tag was given. Aborting");
    process.exit(1);
  }

  if (args._.find(arg => arg === "build")) {
    buildDockerImage(args.t);
  } else if (args._.find(arg => arg === "publish")) {
    publishDockerImage(args.t);
  } else {
    console.log("No valid options supplied. Aborting");
    process.exit(1);
  }
};

// Returns an array of objects in the shape of:
// node -x hey -y cool chocolatey crackers =>
// {_: [chocolatey, crackers], x: hey, y: cool}
const args = parseArgs(process.argv.slice(2));
processArgs(args);
