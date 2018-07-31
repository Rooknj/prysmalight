const gulp = require("gulp"),
  gulpif = require("gulp-if"),
  babel = require("gulp-babel"),
  env = require("gulp-env"),
  nodemon = require("gulp-nodemon"),
  eslint = require("gulp-eslint"),
  run = require("gulp-run-command").default;

gulp.task("clean", run(["rm -rf dist", "docker-compose down"]));

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

gulp.task("set-debug", function(done) {
  env({
    vars: {
      DEBUG: "server,schema,LightService,LightDB,LightLink,LightUtil"
    }
  });
  done();
});

gulp.task("set-development", function(done) {
  env({
    vars: {
      NODE_ENV: "development",
      BABEL_ENV: "development"
    }
  });
  done();
});

gulp.task("set-mock", function(done) {
  env({
    vars: {
      MOCK: true
    }
  });
  done();
});

gulp.task("set-mqtt-host", function(done) {
  env({
    vars: {
      MQTT_HOST: "localhost"
    }
  });
  done();
});

gulp.task("startRedis", run("docker-compose up -d redis"));

gulp.task(
  "startBroker",
  gulp.series("set-mqtt-host", run("docker-compose up -d broker"))
);

gulp.task(
  "start",
  gulp.series(
    gulp.parallel("babel", "set-development", "set-debug", "startRedis"),
    function(done) {
      const stream = nodemon({
        script: "dist/server.js", // run transpiled code
        watch: "src", // watch src code
        tasks: ["babel"], // compile synchronously onChange
        done: done
      });

      return stream;
    }
  )
);

gulp.task(
  "startMock",
  gulp.series(gulp.parallel("set-mock", "startBroker"), "start")
);

gulp.task("default", gulp.series("lint", "babel"));
