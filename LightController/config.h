/************ Configuration Variables ******************/
// Enables Serial and print statements
#define CONFIG_DEBUG true

// The unique name of the light (must be less than 16 characters)
#define CONFIG_NAME "Light 2"

// the maximum value you can set brightness to out of 255 
#define CONFIG_MAX_BRIGHTNESS 255

// pin used for the rgb led strip (PWM)
#define CONFIG_DATA_PIN 3 // This is pin D3 on the NodeMCU ESP8266

// how many leds in your strip?
#define CONFIG_NUM_LEDS 150

// Which LED strip are you using?
#define CONFIG_CHIPSET WS2812B

// What is the color order of your LED strip?
#define CONFIG_COLOR_ORDER GRB

#define CONFIG_MQTT_SERVER_PORT 1883
#define CONFIG_MQTT_USER "pi"
#define CONFIG_MQTT_PASSWORD "MQTTIsBetterThanUDP"
#define CONFIG_MQTT_TOP "lightapp2"
#define CONFIG_MQTT_CONNECTION "connected"
#define CONFIG_MQTT_EFFECT_LIST "effects"
#define CONFIG_MQTT_STATE "state"
#define CONFIG_MQTT_COMMAND "command"

#define CONFIG_WIFI_MANAGER_PW "991f76a6ab"

#define CONFIG_MDNS_HOSTNAME "raspberrypi"

#define CONFIG_OTA_PASSWORD "ESP8266Rulez"

