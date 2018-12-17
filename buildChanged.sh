#!/bin/bash -e

detect_changed_services() {
  echo "----------------------------------------------"
  echo "detecting changed folders for this commit"

  # get a list of all the changed folders only
  git remote set-branches --add origin master
  git fetch
  changed_services=`git diff --name-only HEAD origin/master | grep "^packages" | awk 'BEGIN {FS="/"} {print $2}' | uniq`
  echo "changed folders: "$changed_services

  for service in $changed_services
  do
    if [ "$service" == "$BUILD_ENV" ]; then
      echo "-------------------Building $service---------------------"
      cd "./packages/$service"
      chmod +x build.sh
      ./build.sh
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