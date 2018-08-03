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

// SET-DEBUG: Set the debug environment variable so that we can see debug messages
gulp.task("set-debug", async () => {
  await env({
    vars: {
      DEBUG: "server,schema,LightService,LightDB,LightLink,LightUtil"
    }
  });
});

// SET-DEVELOP: Set node_env to development
gulp.task("set-develop", async () => {
  await env({
    vars: {
      NODE_ENV: "development",
      BABEL_ENV: "development"
    }
  });
});

// SET-MOCK: set the MOCK env to true to start a mock light on startup
gulp.task("set-mock", async () => {
  await env({
    vars: {
      MOCKS: "Mock 1,Mock 2,Mock 3"
    }
  });
});

// SET-MQTT-HOST: set the environment variable to enable using a local MQTT broker
gulp.task("set-mqtt-host", async () => {
  await env({
    vars: {
      MQTT_HOST: "localhost"
    }
  });
});

// START-REDIS: Start the Redis docker container
gulp.task("start-redis", run("docker-compose up -d redis"));

// START-BROKER: Start the Mosquitto docker container
gulp.task("start-broker", run("docker-compose up -d broker"));

// START-BROKER: Start the Mosquitto docker container
gulp.task("start-server", run("docker-compose up -d"));

// START: Start the development node server
const start = function(done) {
  const stream = nodemon({
    script: "src/server.js", // run transpiled code
    watch: "src", // watch src code
    done: done
  });

  return stream;
};
gulp.task(
  "start",
  gulp.series(
    gulp.parallel("set-develop", "set-debug", "start-redis"),
    start
  )
);

// STARTMOCK: Start the development node server with a mock light
gulp.task(
  "startMock",
  gulp.series(
    gulp.parallel("set-mock", "set-mqtt-host", "start-broker"),
    "start"
  )
);

// DEFAULT: TBD
gulp.task("default", gulp.series("lint"));
