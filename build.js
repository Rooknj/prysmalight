// Returns an array of objects in the shape of:
// node -x hey -y cool chocolatey crackers =>
// {_: [chocolatey, crackers], x: hey, y: cool}
const parseArgs = require("minimist");
const {executeCommand, packageWasChanged, PACKAGES} = require("./util");

// Builds the package (Note: using -t local. Change docker build so i dont need to include a tag for building)
const buildPackage = async packageName => {
  if (!process.env.TRAVIS || packageWasChanged(packageName)) {
    await executeCommand(`yarn install --silent`, `./packages/${packageName}`);
    await executeCommand(
      `node scripts/dockerScripts build -t local`,
      `./packages/${packageName}`
    );
  } else {
    console.log(
      `Currently in CI and ${packageName} was not changed. Skipping build`
    );
  }
};

// Process all command line arguments
const processArgs = async args => {
  if (args.all) {
    // Builds docker images for all packages
    console.log("Building all packages");
    PACKAGES.forEach(pack => buildPackage(pack));
  } else {
    // Builds docker images for specified packages
    const packages = args._;

    // If no packages were specified, error out
    if (!packages.length) {
      console.log("No Packages Specified. Aborting");
      process.exit(1);
    }

    // if an invalid package is specified, error out
    packages.forEach(pack => {
      if (!PACKAGES.includes(pack)) {
        console.log(`${pack} is not a valid package. Aborting`);
        process.exit(1);
      }
    });

    // Build all specified packages
    console.log(`Building ${packages}`);
    packages.forEach(pack => buildPackage(pack));
  }
};

const args = parseArgs(process.argv.slice(2));
processArgs(args);
