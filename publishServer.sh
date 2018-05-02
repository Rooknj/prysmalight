#!/bin/bash
echo Building docker image
docker-compose -f docker-compose.prod.yml build

echo Tagging docker image
docker tag lightapp2-server-prod rooknj/lightapp2:server-latest

echo Pushing docker image
docker push rooknj/lightapp2:server-latest