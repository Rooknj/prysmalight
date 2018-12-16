#!/bin/bash -e

detect_changed_services() {
  echo "----------------------------------------------"
  echo "detecting changed folders for this commit"

  # get a list of all the changed folders only
  changed_services=`git diff --name-only HEAD master | grep "^packages" | awk 'BEGIN {FS="/"} {print $2}' | uniq`
  echo "changed folders: "$changed_services

  for service in $changed_services
  do
    if [ "$service" == '$BUILD_ENV' ]; then
      echo "-------------------Building $service---------------------"
      
    fi
  done
}

detect_changed_services
#git diff --name-only HEAD master | grep "^packages"