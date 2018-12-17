echo "deploying client"

deploy() {
  node scripts/dockerScripts tag 
  node scripts/dockerScripts publish
}

if [ "$TRAVIS" == "true" ]; then
  deploy
else
  echo "Not in CI pipeline, aborting"
  exit 1
fi