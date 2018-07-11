#!/bin/bash
# sysinfo_page - A script to publish lightapp2-client to docker cloud

##### Variables
tag=
confirm=n
skipConfirm=

##### Functions
usage() {
    echo "usage: sysinfo_page [-t --tag]  [-Y | --yes] [-h | --help]"
}

buildDocker() {
    echo "Building docker image"
    docker-compose build

    echo "Tagging docker image with \"server-$tag\""
    docker tag lightapp2-server-prod rooknj/lightapp2:server-$tag

    echo "Pushing docker image"
    docker push rooknj/lightapp2:server-$tag
}

getTagFromUser() {
    printf "Enter the tag for your image: "
    read tag
}

getConfirmationFromUser() {
    printf "I will tag this docker image with \"server-$tag\", is that ok? [Y/n]: " 
    read confirm
}

promptUser() {
    getConfirmationFromUser
    if [ "$CONFIRM" = "Y" ] ; then
        buildDocker
    else
        echo "Aborting"
    fi
}

while [ "$1" != "" ]; do
    case $1 in
        -t | --tag )            shift
                                tag=$1
                                ;;
        -Y | --yes )            skipConfirm=1
                                ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done

# If the tag is empty, prompt the user for one
if [ "$tag" = "" ]; then
    getTagFromUser
fi

if [ "$DEPLOY_ENV" = "TRAVIS" ] ; then
    echo "Logging into docker"
    docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
fi

# If the user skipped the confirmation step, then go straight to building
if [ "$skipConfirm" = "1" ]; then
    buildDocker
else
    promptUser
fi