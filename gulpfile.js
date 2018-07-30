const gulp = require("gulp"),
  gulpif = require("gulp-if"),
  babel = require("gulp-babel"),
  env = require("gulp-env"),
  nodemon = require("gulp-nodemon"),
  eslint = require("gulp-eslint");

gulp.task("default", function() {
  // place code for your default task here
});

gulp.task("lint", function() {
  const stream = gulp
    .src(["**/*.js", "!node_modules/**"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

  return stream;
});

gulp.task("babel", function() {
  // Can re-enable caching if transpile time becomes too slow (put these outside)
  //const Cache = require("gulp-file-cache");
  //const cache = new Cache();
  const stream = gulp
    .src("src/**/*") // Get all files under the src directory
    //.pipe(cache.filter()) // remember files
    .pipe(gulpif("*.js", babel())) // transpile any javascript files, forward others
    //.pipe(cache.cache()) // cache them
    .pipe(gulp.dest("./dist")); // write files
  return stream; // important for gulp-nodemon to wait for completion
});

gulp.task("start", ["babel"], function(done) {
  // Set up environment variables
  env({
    vars: {
      NODE_ENV: "development",
      BABEL_ENV: "development",
      DEBUG: "server,schema,LightService,LightDB,LightLink,LightUtil"
    }
  });

  // Run nodemon
  const stream = nodemon({
    script: "dist/server.js", // run transpiled code
    watch: "src", // watch src code
    tasks: ["babel"], // compile synchronously onChange
    done: done
  });

  return stream;
});
