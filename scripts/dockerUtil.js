const getDockerUtil = require("prysma-docker");
const packageJson = require("../package.json");

const IMAGE_NAME = "rooknj/prysmalight";
const VERSION = packageJson.version;

const dockerUtil = getDockerUtil(IMAGE_NAME, VERSION);

dockerUtil(process.argv);
