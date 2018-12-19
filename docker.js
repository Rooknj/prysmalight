//rooknj/lightapp2-client:<version>?-rpi



const parseArgs = require("minimist");
const {} = require("util");

const SERVICE = "client";
const ARCHITECTURES = ["x64", "rpi"];

// Build a docker image
const buildDockerImage = async dockerComposeFile => {
  const command = `docker-compose${
    dockerComposeFile ? ` -f ${dockerComposeFile} ` : " "
  }build`;
  await executeCommand(command);
  return;
};

// Tag the docker image
const tagDockerImage = async (dockerImageName, dockerTag) => {
  const command = `docker tag ${dockerImageName} ${dockerTag}`;
  await executeCommand(command);
};

// Publish the docker image
const publishDockerImage = async dockerTag => {
  const command = `docker push ${dockerTag}`;
  await executeCommand(command);
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
  if (!tag) {
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
    console.log("tagging");
    ARCHITECTURES.forEach(arch => {
      const dockerTag = generateDockerTag(tag, SERVICE, arch);
      const dockerImageName = generateDockerImageName(SERVICE, arch);
      tagDockerImage(dockerImageName, dockerTag);
    });
  } else if (commands.includes("publish")) {
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
