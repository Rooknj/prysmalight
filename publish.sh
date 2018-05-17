#!/bin/bash
printf "Enter the tag for your image: "
read TAG
printf "I will tag this docker image with \"broker-$TAG\", is that ok? [Y/n]: " 
read CONFIRM

if [ "$CONFIRM" = "Y" ] ; then
    echo "Building docker image"
    docker-compose build

    echo "Tagging docker image with \"broker-$TAG\""
    docker tag lightapp2-broker-prod rooknj/lightapp2:broker-$TAG

    echo "Pushing docker image"
    docker push rooknj/lightapp2:broker-$TAG
else
    echo "Aborting"
fi