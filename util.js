const util = require("util");
const child_process = require("child_process");
const exec = util.promisify(child_process.exec);
const execSync = child_process.execSync;

const PACKAGES = ["api", "client", "controller"];

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

const packageWasChanged = packageName => {
  let currentBranch;
  if (process.env.TRAVIS) {
    console.log("In CI, adding master as remote");
    execSync(`git remote set-branches --add origin master`);
    execSync(`git fetch`);
    currentBranch = process.env.TRAVIS_BRANCH;
  } else {
    currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
  }

  console.log("Current Branch:", currentBranch);

  let diffBranches;
  if (currentBranch === "master") {
    diffBranches = "HEAD^ HEAD";
  } else {
    diffBranches = "HEAD origin/master";
  }

  console.log("Diff Branches:", diffBranches);

  const changedFiles = execSync(`git diff --name-only ${diffBranches}`)
    .toString()
    .trim()
    .split("\n")
    .map(filename => filename.trim());
  console.log("Changed Files:", changedFiles);

  let wasChanged = false;
  changedFiles.forEach(file => {
    const directories = file.split("/");
    if (directories.length > 1) {
      const pkg = directories[1];
      if (pkg === packageName) {
        wasChanged = true;
      }
    }
  });
  return wasChanged;
};

const buildDockerImage = async (pkg, tag, rpi) => {
  const path = `./packages/${pkg}`;
  if (rpi) {
    const image = `rooknj/lightapp2-${pkg}:${tag}-rpi`;
    const latest = `rooknj/lightapp2-${pkg}:latest-rpi`;
    console.log("Pulling", latest);
    await executeCommand(`docker pull ${latest}`);
    console.log("Building", image);
    await executeCommand(
      `docker build -f ${path}/rpi.Dockerfile --cache-from ${latest} -t ${image} ${path}`
    );
  } else {
    const image = `rooknj/lightapp2-${pkg}:${tag}`;
    const latest = `rooknj/lightapp2-${pkg}:latest`;
    console.log("Pulling", latest);
    await executeCommand(`docker pull ${latest}`);
    console.log("Building", image);
    await executeCommand(
      `docker build --cache-from ${latest} -t ${image} ${path}`
    );
  }
};

const publishDockerImage = async (pkg, tag, rpi) => {
  if (rpi) {
    await executeCommand(`docker push rooknj/lightapp2-${pkg}:${tag}-rpi`);
  } else {
    await executeCommand(`docker push rooknj/lightapp2-${pkg}:${tag}`);
  }
};

module.exports = {
  executeCommand,
  packageWasChanged,
  PACKAGES,
  buildDockerImage,
  publishDockerImage
};
