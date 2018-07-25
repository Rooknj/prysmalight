// Returns an array of objects in the shape of:
// node -x hey -y cool chocolatey crackers =>
// {_: [chocolatey, crackers], x: hey, y: cool}
const parseArgs = require("minimist");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const SERVICE = "client";
const ARCHITECTURES = ["x64", "rpi"];

const displayUsage = () => {
  console.log(`
Usage: buildDocker COMMAND

A script to build docker images of lightapp2-client

Options:
  -h, --help          Display usage
      --rpi           Only build for Raspberry Pi
      --x64           Only build for x64 machines
  -y, --yes           Auto accept all prompts
  -t        string    Use this string as a tag instead of defaults

Commands:
  build               Builds the docker images
  tag                 Tags the docker images
  publish             Publishes the docker images
    `);
};

// Build a docker image
const buildDockerImage = async dockerComposeFile => {
  const command = `docker-compose${
    dockerComposeFile ? ` -f ${dockerComposeFile} ` : " "
  }build`;
  console.log(`Executing: ${command}`);
  const { stdout, stderr } = await exec(command);
  console.log(`Finished: ${command}`);
  console.log("STDOUT:", stdout);
  console.log("STDERR:", stderr);
  return;
};

// Tag the docker image
const tagDockerImage = async (dockerImageName, dockerTag) => {
  const command = `docker tag ${dockerImageName} ${dockerTag}`;
  console.log(`Executing: ${command}`);
  const { stdout, stderr } = await exec(command);
  console.log(`Finished: ${command}`);
  console.log("STDOUT:", stdout);
  console.log("STDERR:", stderr);
};

// Publish the docker image
const publishDockerImage = async dockerTag => {
  const command = `docker push ${dockerTag}`;
  console.log(`Executing: ${command}`);
  const { stdout, stderr } = await exec(command);
  console.log(`Finished: ${command}`);
  console.log("STDOUT:", stdout);
  console.log("STDERR:", stderr);
};

// Create the tag for the docker image
const generateDockerTag = (tag, service, arch) =>
  `rooknj/lightapp2:${service}-${arch}-${tag}`;

// Find the name of the docker image created in the buildDockerImage command
const generateDockerImageName = (service, arch) =>
  `lightapp2-${service}-${arch}`;

// Get the base tag to be used in this script
const getTag = tag => {
  if (tag) return tag;
  const travisTag = process.env.TRAVIS_TAG;
  if (travisTag) {
    return travisTag
  }

  const branchName = process.env.TRAVIS_BRANCH;
  if (branchName) {
    if (branchName === "master") {
      return "latest";
    }
    return "test";
  } else {
    return;
  }
};

// Process all command line arguments
const processArgs = args => {
  const commands = args._;

  // Display usage and exit if -h flag is set
  if (args.h) {
    displayUsage();
    return;
  }

  // If there were no commands supplied, exit and display usage
  if (commands.length < 1) {
    console.error("No Command Provided: Aborting");
    displayUsage();
    return;
  }

  // Get the tag
  const tag = getTag(args.t);
  if(!tag) {
    console.log("No tag was provided and you are not in CI pipeline. Aborting");
    return;
  }
  console.log("TAG:", tag);

  if (commands.includes("build")) {
    console.log("Building");
    ARCHITECTURES.forEach(arch => {
      if (arch === "x64") {
        buildDockerImage();
      } else if (arch === "rpi") {
        buildDockerImage("docker-compose.rpi.yml");
      } else {
        console.log("Unsupported Architecture:", arch);
      }
    });
  } else if (commands.includes("tag")) {
    if (process.env.TRAVIS_PULL_REQUEST) {
      console.log("This is a pull request. Skipping tag");
      return;
    }
    console.log("tagging");
    ARCHITECTURES.forEach(arch => {
      const dockerTag = generateDockerTag(tag, SERVICE, arch);
      const dockerImageName = generateDockerImageName(SERVICE, arch);
      tagDockerImage(dockerImageName, dockerTag);
    });
  } else if (commands.includes("publish")) {
    if (process.env.TRAVIS_PULL_REQUEST) {
      console.log("This is a pull request. Skipping publish");
      return;
    }
    console.log("publishing");
    ARCHITECTURES.forEach(arch => {
      const dockerTag = generateDockerTag(tag, SERVICE, arch);
      publishDockerImage(dockerTag);
    });
  } else {
    console.log("Invalid Command Provided");
    displayUsage();
    return;
  }
};

const args = parseArgs(process.argv.slice(2));
processArgs(args);
