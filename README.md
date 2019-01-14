# Prysmalight
Monorepo for Prysmalight

# Important Notes
- This app is served at http://prysma.local
  - If your device doesn’t support mDNS, then you’ll have to use the IP address of your Pi instead of prysma.local. For example, http://192.168.0.9. You should be able to find the IP address of your Pi from the admin interface of your router.
- You must update the ESP8266 yourself using the Arduino IDE. This is a DIY project currently so you need to update this yourself
- You can not dynamically change the number of LEDs in your strip. This requires a firmware update on the esp8266
- The Hub is the only thing that talks to the lights. All services have to go through the RPI hub

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

