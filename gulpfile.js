const gulp = require("gulp"),
  env = require("gulp-env"),
  nodemon = require("gulp-nodemon"),
  eslint = require("gulp-eslint"),
  run = require("gulp-run-command").default

// CLEAN: Delete all generated files and bring down any docker containers
gulp.task("clean", gulp.parallel(run(["rm -rf build"]), "cleanDocker"));

// LINT: Run the linter and display the output
const runLinter = () => {
  const stream = gulp
    .src(["**/*.js", "!node_modules/**"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

  return stream;
};
gulp.task("lint", runLinter);

// DEFAULT: TBD
gulp.task("default", gulp.series("lint"));
