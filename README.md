Lightapp2-esp8266
===========================================

<p align="center">
  <img alt="Lightapp2-esp8266" src="./esp8266.png" width="480">
</p>

<p align="center">
  An arduino sketch to control addressable RGB led strips
</p>

<!-- <p align="center">
  <a href="https://www.npmjs.com/package/lerna"><img alt="NPM Status" src="https://img.shields.io/npm/v/lerna.svg?style=flat"></a>
  <a href="https://travis-ci.org/lerna/lerna"><img alt="Travis Status" src="https://img.shields.io/travis/lerna/lerna/master.svg?style=flat&label=travis"></a>
</p> -->

# Changing the light settings
## Inside config.h
- You Must change CONFIG_NAME to be unique to every light
- You can choose to have a dynamic ip address if you comment out STATIC_IP
  - If you choose to have a STATIC_IP address, it must be unique to the device
- Change CONFIG_NUM_LEDS to be the total number of LEDs you are controlling
- Change CONFIG_MAX_BRIGHTNESS to set a maximum brightness value from 0-255.
- Change CONFIG_CHIPSET to be the chipset of the leds you are using


# Arduino IDE Setup
## Set up ESP8266 Arduino Support
- Install ESP8266 Board Manager: https://github.com/esp8266/Arduino#installing-with-boards-manager
- Select the correct board: Tools -> Board -> NodeMCU 1.0
- Set a fast upload speed: Upload Speed -> 512000

## Install Arduino Libraries
- WiFiManager by Tzapu: Version 0.14.0 (or latest)
- PubSubClient by Niick O'Leary: Version 2.7.0 (or latest)
- ArduinoJson by Benoit Blanchon: Version 5.13.3 (Will need to manually select this one)
  - Go to ~/Documents/Arduino/libraries/PubSubClient/src/PubSubClient.h and change MQTT_MAX_PACKET_SIZE to 512 instead of 128. This is because the messages sent by this app are greater than 128 bytes and will be ignored by the pubsubclient unless increased.
- FastLED Fork by Coryking
  - Go to https://github.com/coryking/FastLED/tree/47a96ac42fa95d70c02316c386a7feb033fee7eb and download the library as a .zip file
  - Open the Arduino IDE and go to Sketch -> Include Library -> Add .ZIP Library
  - Navigate to the downloaded .zip file and add it

## Set up OTA upload
- Install Python 2.7 for OTA uploads: http://esp8266.github.io/Arduino/versions/2.0.0/doc/ota_updates/ota_updates.html

# First Time Upload Note
- Make sure you set up wifi using the WiFi manager the first time you upload a sketch on an ESP8266 or you move to a new network.
- If you have a static IP address set, The ESP8266 may say it connects to WiFi the first time you upload a sketch to it, but it really didn't. Just set it back to a dynamic IP address and it should work. Once that happens, set it back to a Static IP address and it should work just fine now.

