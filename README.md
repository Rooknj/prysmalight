Lightapp2-client [![Build Status](https://travis-ci.org/Rooknj/lightapp2-client.svg?branch=master)](https://travis-ci.org/Rooknj/lightapp2-client)
===========================================

<p align="center">
  <img alt="Lightapp2-client" src="./lights.png" width="400">
</p>

<p align="center">
  A React app to control Addressable LED strips
</p>

## Requirements to run
- You must have at least Node 8.11.3 installed
- You must have yarn installed

## Commands
- ```yarn start [--local]``` - Starts the Server
  - ```--local``` will run the client against a server running at localhost:4001 (Default is raspberrypi.local:4001)
- ```yarn build``` - Makes a production build of the client (Uses React-scripts build from create-react-app)
- ```yarn test [--no-watch]``` - Runs unit tests
  - ```--no-watch``` will run the unit tests once and exit (Default is watch mode)

## Development scripts
These scripts are useful for creating custom docker images for testing

- ```node scripts/dockerScripts build -t <TAG>``` - Builds a docker image
- ```node scripts/dockerScripts tag -t <TAG>``` - Tags the built docker image with the supplied tag
- ```node scripts/dockerScripts publish -t <TAG>``` - Pushes the image with the supplied tag to my docker-cloud repository


