"use strict";

process.env.REACT_APP_ENV = "test";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

let argv = process.argv.slice(2);

// Watch unless on CI or in coverage mode
if (argv.indexOf("--no-watch") >= 0) {
  process.env.CI = "true";
}

// TODO: Run react scripts test --env=jsdom
