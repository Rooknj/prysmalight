const gulp = require("gulp");
// const env = require("gulp-env");
// const nodemon = require("gulp-nodemon");
const eslint = require("gulp-eslint");

gulp.task("default", function() {
  // place code for your default task here
});

gulp.task("lint", function() {
  gulp.src(["**/*.js", "!node_modules/**"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// task("start", function() {
//   process.env.DEBUG = "server,schema,LightService,LightDB,LightLink,LightUtil";
//   process.env.NODE_ENV = "development";
//   process.env.BABEL_ENV = "development";
//   env({
//     vars: {
//       // any variables you want to overwrite
//       NODE_ENV: "development",
//       BABEL_ENV: "development",
//       DEBUG: "server,schema,LightService,LightDB,LightLink,LightUtil"
//     }
//   });

//   nodemon({
//     script: "src/server.js",
//     tasks: ["browserify"]
//   });
//   // place code for your default task here
// });

// task("build", function() {
//   // place code for your default task here
// });

// task("publish", function() {
//   // place code for your default task here
// });
