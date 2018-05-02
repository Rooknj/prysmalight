#!/bin/bash
printf "Enter the tag for your image: "
read TAG
printf "I will tag this docker image with \"$TAG\", is that ok? [Y/n]: " 
read CONFIRM

if [ "$CONFIRM" = "Y" ] ; then
    echo "Building docker image"
    docker-compose -f docker-compose.prod.yml build

    echo "Tagging docker image with \"$TAG\""
    docker tag lightapp2-server-prod rooknj/lightapp2:$TAG

    echo "Pushing docker image"
    docker push rooknj/lightapp2:$TAG
else
    echo "Aborting"
fi