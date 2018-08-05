"use strict";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

const { execSync } = require("child_process");

let argv = process.argv.slice(2);

if (argv.indexOf("--local") >= 0) {
  console.log("Using Local Server");
  process.env.REACT_APP_ENV="local";
}

// TODO: Run react scripts start