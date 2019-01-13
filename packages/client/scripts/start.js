"use strict";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

//const spawnSync = require("child_process").spawnSync;
const spawn = require("cross-spawn");
const spawnArgs = require("spawn-args");
const { delimiter } = require("path");
const pathResolve = require("path").resolve;

let argv = process.argv.slice(2);

process.env.REACT_APP_ENV = "dev";

if (argv.indexOf("--local") >= 0) {
  console.log("Using Local Server");
  process.env.REACT_APP_ENV = "dev-local";
}

const args = spawnArgs("react-scripts start", { removequotes: "always" });

const result = spawn.sync(args.shift(), args, {
  stdio: ["ignore", "inherit", "inherit"],
  cwd: process.cwd(),
  env: Object.assign({}, process.env, {
    PATH:
      process.env.PATH +
      delimiter +
      pathResolve(process.cwd(), "node_modules", ".bin")
  })
});

