#!/bin/bash -e

detect_changed_services() {
  echo "----------------------------------------------"
  echo "detecting changed folders for this commit"

  # get a list of all the changed folders only
  git remote set-branches --add origin master
  git fetch
  changed_services=()
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "-------------------Master Branch---------------------"
    changed_services=("client" "api" "controller")
  else
    echo "-------------------$TRAVIS_BRANCH---------------------"
    changed_services=`git diff --name-only HEAD origin/master | grep "^packages" | awk 'BEGIN {FS="/"} {print $2}' | uniq`
  fi
  echo "changed services: "$changed_services

  for service in $changed_services
  do
    if [ "$service" == "$BUILD_ENV" ]; then
      echo "-------------------Deploying $service---------------------"
      cd "./packages/$service"
      chmod +x deploy.sh
      ./deploy.sh
    fi
  done
}

if [ "$TRAVIS" == "true" ]; then
  detect_changed_services
else
  echo "Not in CI pipeline, aborting"
  exit 1
fi
#git diff --name-only HEAD master | grep "^packages"