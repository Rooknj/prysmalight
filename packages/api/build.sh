echo "building api"

build() {
  curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 1.9.2
  export PATH="$HOME/.yarn/bin:$PATH"
  yarn install --silent
  node scripts/dockerScripts build
}

if [ "$TRAVIS" == "true" ]; then
  build
else
  echo "Not in CI pipeline, aborting"
  exit 1
fi