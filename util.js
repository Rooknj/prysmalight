const util = require("util");
const child_process = require("child_process");
const exec = util.promisify(child_process.exec);
const execSync = child_process.execSync;

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
    execSync(`git remote set-branches --add origin master`);
    execSync(`git fetch`);
    currentBranch = process.env.TRAVIS_BRANCH;
  } else {
    currentBranch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  }

  console.log("Current Branch:", currentBranch);

  let diffBranches;
  if (currentBranch === "master") {
    diffBranches = "HEAD^ HEAD";
  } else {
    diffBranches = "HEAD origin/master";
  }

  console.log("Diff Branches:", diffBranches);

  const diff = execSync(`git diff --name-only ${diffBranches}`).toString().trim();
  console.log("diff:", diff);
  return false;
};

console.log(packageWasChanged(process.argv[2]));

module.exports = { executeCommand, packageWasChanged };
