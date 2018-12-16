"use strict";

process.env.REACT_APP_ENV = "test";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

const spawn = require("cross-spawn");
const spawnArgs = require("spawn-args");
const { delimiter } = require("path");
const pathResolve = require("path").resolve;

let argv = process.argv.slice(2);

// Watch unless on CI or in coverage mode
if (argv.indexOf("--no-watch") >= 0) {
  process.env.CI = "true";
}

// TODO: Run react scripts test --env=jsdom
const args = spawnArgs("react-scripts test --env=jsdom", { removequotes: "always" });

const result = spawn.sync(args.shift(), args, {
  stdio: ["inherit", "inherit", "inherit"], // stdin, stdout, stderr. set to ignore to ignore
  cwd: process.cwd(),
  env: Object.assign({}, process.env, {
    PATH:
      process.env.PATH +
      delimiter +
      pathResolve(process.cwd(), "node_modules", ".bin")
  })
});