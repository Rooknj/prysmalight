const util = require("util");
const child_process = require("child_process");
const exec = util.promisify(child_process.exec);
const parseArgs = require("minimist");

const IMAGE_NAME = "rooknj/prysmalight";

/**
 * Executes a command then prints STDOUT and STDERR.
 * Any command that errors will cause the process to exit with error code 1.
 * @param {*} command
 * @param {*} cwd
 */
const executeCommand = async (command, cwd = null) => {
  console.log(`Executing: ${command} in ${cwd || "."}`);
  try {
    const { stdout, stderr } = await exec(command, { cwd });
    console.log(`Finished: ${command} in ${cwd || "."}`);
    console.log("STDOUT:");
    console.log(stdout || "None");
    console.log("STDERR:");
    console.log(stderr || "None");
    return stdout;
  } catch (error) {
    console.log(`Error Executing: ${command} in ${cwd || "."}`);
    console.log("STDOUT:");
    console.log(error.stdout || "None");
    console.log("STDERR:");
    console.log(error.stderr || "None");
    process.exit(1);
  }
};

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
  await executeCommand(`docker build -t ${image} .`);
};

const publishDockerImage = async tag => {
  const image = getDockerImage(tag);
  console.log("Publishing", image);
  await executeCommand(`docker push ${image}`);
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
