#!/bin/bash
printf "Enter the tag for your image: "
read TAG
printf "I will tag this docker image with \"server-$TAG\", is that ok? [Y/n]: " 
read CONFIRM

if [ "$CONFIRM" = "Y" ] ; then
    echo "Building docker image"
    docker-compose build

    echo "Tagging docker image with \"server-$TAG\""
    docker tag lightapp2-server-prod rooknj/lightapp2:server-$TAG

    echo "Pushing docker image"
    docker push rooknj/lightapp2:server-$TAG
else
    echo "Aborting"
fi