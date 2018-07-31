const gulp = require("gulp"),
  gulpif = require("gulp-if"),
  babel = require("gulp-babel"),
  env = require("gulp-env"),
  nodemon = require("gulp-nodemon"),
  eslint = require("gulp-eslint"),
  run = require("gulp-run-command").default;

gulp.task("clean", run(["rm -rf dist", "docker-compose down"]));

const lint = () => {
  const stream = gulp
    .src(["**/*.js", "!node_modules/**"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

  return stream;
};
gulp.task("lint", lint);

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

gulp.task("set-debug", async () => {
  await env({
    vars: {
      DEBUG: "server,schema,LightService,LightDB,LightLink,LightUtil"
    }
  });
});

gulp.task("set-development", async () => {
  await env({
    vars: {
      NODE_ENV: "development",
      BABEL_ENV: "development"
    }
  });
});

gulp.task("set-mock", async () => {
  await env({
    vars: {
      MOCK: true
    }
  });
});

gulp.task("set-mqtt-host", async () => {
  await env({
    vars: {
      MQTT_HOST: "localhost"
    }
  });
});

gulp.task("startRedis", run("docker-compose up -d redis"));

gulp.task("startBroker", run("docker-compose up -d broker"));

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
    gulp.parallel("babel", "set-development", "set-debug", "startRedis"),
    start
  )
);

gulp.task(
  "startMock",
  gulp.series(
    gulp.parallel("set-mock", "set-mqtt-host", "startBroker"),
    "start"
  )
);

gulp.task("test", function() {});

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

  await run("pkg . --targets " + target)();
};
gulp.task("build", gulp.series("babel", makePkg));

gulp.task("default", gulp.series("lint", "babel"));
