Lightapp2-esp8266
===========================================

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

## Set up OTA upload
- Install Python 2.7 for OTA uploads: http://esp8266.github.io/Arduino/versions/2.0.0/doc/ota_updates/ota_updates.html


