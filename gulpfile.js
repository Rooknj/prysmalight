const gulp = require("gulp"),
  gulpif = require("gulp-if"),
  babel = require("gulp-babel"),
  env = require("gulp-env"),
  nodemon = require("gulp-nodemon"),
  eslint = require("gulp-eslint"),
  run = require("gulp-run-command").default

gulp.task("cleanDocker", run("docker-compose down"));

gulp.task("cleanRedis", run("rm -rf redisData"))

// CLEAN: Delete all generated files and bring down any docker containers
gulp.task("clean", gulp.parallel(run(["rm -rf dist build"]), "cleanDocker"));

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

// BABEL: Transpile javascript code so it works on node 8
const transpile = () => {
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
};
gulp.task("babel", transpile);

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

// SET-TEST: Set node_env to test
gulp.task("set-test", async () => {
  await env({
    vars: {
      NODE_ENV: "test",
      BABEL_ENV: "test"
    }
  });
});

// SET-PROD: Set node_env to production
gulp.task("set-prod", async () => {
  await env({
    vars: {
      NODE_ENV: "production",
      BABEL_ENV: "production"
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
    script: "dist/server.js", // run transpiled code
    watch: "src", // watch src code
    tasks: ["babel"], // compile synchronously onChange
    done: done
  });

  return stream;
};
gulp.task(
  "start",
  gulp.series(
    gulp.parallel("babel", "set-develop", "set-debug", "start-redis"),
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

// TEST: Run all unit tests
gulp.task("test", gulp.series("set-test", run("jest ./src/")));

gulp.task(
  "testIntegration",
  gulp.series("set-test", "cleanDocker", "cleanRedis", "start-server", run("jest ./test/integration"), "cleanDocker")
);

// BUILD: Build an executable with pkg
const makePkg = async () => {
  let target;
  if (process.env.PKG_TARGET) {
    // Run pkg with this target
    target = process.env.PKG_TARGET;
  } else {
    switch (process.platform) {
      case "darwin": // mac
        target = "node8-macos-x64";
        break;
      case "win32": // windows
        target = "node8-win-x64";
        break;
      case "linux": // linux
        target = "node8-linux-x64";
        break;
      default:
        return new Error("No target specified");
    }
  }

  await run(`pkg . --targets ${target} --output ./build/lightapp2-server`)();
};
gulp.task("build", gulp.series("set-prod", "babel", makePkg));

// DEFAULT: TBD
gulp.task("default", gulp.series("lint", "babel"));
