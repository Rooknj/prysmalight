# lightapp2
Monorepo for lightapp2

# Package Structure
  - scripts - javascript scripts
    - docker.js - handles docker commands
      - build - builds docker images
      - tag - tags docker images
      - publish - publishes docker images to the cloud repository
  - src - holds main package code
  - Dockerfile - dockerfile for x64 images
  - rpi.Dockerfile - dockerfile for raspberry pi images
  - docker-compose.yml - docker compose for x64 images
  - docker-compose.rpi.yml - docker compose for raspberry pi images
  - .dockerignore - docker ignore file
  - package.json - holds all package commands
    - start - starts the program running locally
    - build - builds the program for development
    - test - tests the program
    - docker - handles docker integrations
  - yarn.lock - yarn lock file

# Commands
- node start
- node build
  - builds all or selected packages
  - in CI, builds changed packages
- node deploy

