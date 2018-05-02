#!/bin/bash
#!/bin/bash
echo Building docker image
docker-compose -f docker-compose.prod.yml build

echo Tagging docker image
docker tag lightapp2-client-prod rooknj/lightapp2:client-latest

echo Pushing docker image
docker push rooknj/lightapp2:client-latest