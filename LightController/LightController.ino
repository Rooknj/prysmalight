/*
  __  __         ______               _____       _____ _ 
 |  \/  |       |  ____|             |_   _|     |  __ (_)
 | \  / |_   _  | |__ __ _  ___ ___    | |  ___  | |__) | 
 | |\/| | | | | |  __/ _` |/ __/ _ \   | | / __| |  ___/ |
 | |  | | |_| | | | | (_| | (_|  __/  _| |_\__ \ | |   | |
 |_|  |_|\__, | |_|  \__,_|\___\___| |_____|___/ |_|   |_|
          __/ |                                           
         |___/                                           
*/

#include <ESP8266WiFi.h>          // ESP8266 Core WiFi Library
#include <ESP8266mDNS.h>          // Enables finding addresses in the .local domain
#include <DNSServer.h>            // Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h>     // Local WebServer used to serve the configuration portal
#include <ArduinoOTA.h>           // Update ESP8266 over wifi
#include <WiFiManager.h>          // https://github.com/tzapu/WiFiManager WiFi Configuration Magic
#include <PubSubClient.h>         // MQTT client library
#include "FastLED.h"              // LED strip control library
#include <ArduinoJson.h>          // Parse JSON


/************ Configuration Variables ******************/
#define MQTT_VERSION MQTT_VERSION_3_1_1
// the maximum value you can set brightness to out of 255 
const uint8_t MAX_BRIGHTNESS = 63;
// pin used for the rgb led strip (PWM)
#define DATA_PIN 3
// how many leds in your strip?
#define NUM_LEDS 150
// Enables Serial and print statements
#define DEBUG true



/************ MQTT Setup Variables ******************/
// MQTT: ID, server IP, port, username and password
const PROGMEM char* MQTT_CLIENT_ID = "office_rgb_light";
char MQTT_SERVER_IP[16];
const PROGMEM uint16_t MQTT_SERVER_PORT = 1883;
//const PROGMEM char* MQTT_USER = "[Redacted]";
//const PROGMEM char* MQTT_PASSWORD = "[Redacted]";

// MQTT: topics
// connection
const PROGMEM char* MQTT_LIGHT_CONNECTED_TOPIC = "office/rgb1/connected";

// state
const PROGMEM char* MQTT_LIGHT_STATE_TOPIC = "office/rgb1/light/state";
const PROGMEM char* MQTT_LIGHT_COMMAND_TOPIC = "office/rgb1/light/set";

// payloads by default (on/off)
const PROGMEM char* LIGHT_ON = "ON";
const PROGMEM char* LIGHT_OFF = "OFF";
const PROGMEM char* LIGHT_CONNECTED = "2";
const PROGMEM char* LIGHT_DISCONNECTED = "0";

// buffer used to send/receive data with MQTT
const uint8_t MSG_BUFFER_SIZE = 20;
char m_msg_buffer[MSG_BUFFER_SIZE]; 

WiFiClient wifiClient;
PubSubClient client(wifiClient);

const int BUFFER_SIZE = JSON_OBJECT_SIZE(20);



/************ Data Global Variables ******************/
// variables used to store the state, the brightness and the color of the light
boolean stateOn = false;
uint8_t brightness = 100;
uint8_t red = 0;
uint8_t green = 255;
uint8_t blue = 0;
// define the array of leds
CRGB leds[NUM_LEDS];


// Real values to write to the LEDs (ex. including brightness and state)
byte realRed = 0;
byte realGreen = 0;
byte realBlue = 0;

// Globals for fade/transitions
bool startFade = false;
unsigned long lastLoop = 0;
int transitionTime = 0;
bool inFade = false;
int loopCount = 0;
int stepR, stepG, stepB;
int redVal, grnVal, bluVal;



/************ Functions ******************/
// function called to fill the LED strip a solid color
void setColor(uint8_t p_red, uint8_t p_green, uint8_t p_blue) {
  fill_solid(leds, NUM_LEDS, CRGB(p_red, p_green, p_blue));
  FastLED.show();
}



// function called when a MQTT message arrived
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("INFO: Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  char message[length + 1];
  for (int i = 0; i < length; i++) {
    message[i] = (char)payload[i];
  }
  message[length] = '\0';
  Serial.println(message);

  if (!processJson(message)) {
    return;
  }

  if (stateOn) {
    // Update lights
    realRed = red;
    realGreen = green;
    realBlue = blue;
  }
  else {
    realRed = 0;
    realGreen = 0;
    realBlue = 0;
  }

  startFade = true;
  inFade = false; // Kill the current fade

  sendState();
}


// Take JSON message and parse it
bool processJson(char* message) {
  StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;

  JsonObject& root = jsonBuffer.parseObject(message);

  if (!root.success()) {
    Serial.println("ERROR: parseObject() failed");
    return false;
  }

  if (root.containsKey("state")) {
    if (strcmp(root["state"], LIGHT_ON) == 0) {
      stateOn = true;
      setColor(red, green, blue);
    }
    else if (strcmp(root["state"], LIGHT_OFF) == 0) {
      stateOn = false;
      setColor(0, 0, 0);
    }
  }

  if (root.containsKey("color")) {
    if(!stateOn){
      stateOn = true;
    }
    red = root["color"]["r"];
    green = root["color"]["g"];
    blue = root["color"]["b"];
    setColor(red, green, blue);
  }

  if (root.containsKey("brightness")) {
    brightness = root["brightness"];
    FastLED.setBrightness(map(brightness, 0, 100, 0, MAX_BRIGHTNESS));
    FastLED.show();
  }

  if (root.containsKey("transition")) {
    transitionTime = root["transition"];
  }
  else {
    transitionTime = 0;
  }
  
  return true;
}



// send light state over MQTT
void sendState() {
  StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;

  JsonObject& root = jsonBuffer.createObject();

  // populate payload with state
  root["state"] = (stateOn) ? LIGHT_ON : LIGHT_OFF;

  // populate payload with color
  JsonObject& color = root.createNestedObject("color");
  color["r"] = red;
  color["g"] = green;
  color["b"] = blue;
  
  // populate payload with brightness
  root["brightness"] = brightness;

  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  client.publish(MQTT_LIGHT_STATE_TOPIC, buffer, true);
}


// MQTT connect/reconnect function
boolean reconnect() {
  if (client.connect(MQTT_CLIENT_ID, MQTT_LIGHT_CONNECTED_TOPIC, 0, true, LIGHT_DISCONNECTED)) {
    Serial.println("INFO: connected");
    
    // Once connected, publish an announcement...
    // publish that the ESP is connected
    client.publish(MQTT_LIGHT_CONNECTED_TOPIC, LIGHT_CONNECTED, true);
    
    // publish the initial values
    sendState();

    // ... and resubscribe
    client.subscribe(MQTT_LIGHT_COMMAND_TOPIC);
  }
  return client.connected();
}



/************ WIFI Setup ******************/
void setupWifi() {
  // Autoconnect to Wifi
  WiFiManager wifiManager;
  if (!wifiManager.autoConnect("Nick's Lightapp-ESP8266", "991f76a6ab")) {
    // (AP-Name, Password)
    Serial.println("ERROR: failed to connect to Wifi");
    Serial.println("DEBUG: try resetting the module");
    delay(3000);
    ESP.reset();
    delay(5000);
  }
  Serial.println("INFO: connected to Wifi :)");

  char hostString[16] = {0};
  if (!MDNS.begin(hostString)) {
    Serial.println("Error setting up MDNS responder!");
  }
  int n = MDNS.queryService("mqtt", "tcp");
  if (n == 0) {
    Serial.println("no services found");
  }
  else {
    for (int i = 0; i < n; ++i) {
      // Going through every available service,
      // we're searching for the one whose hostname 
      // matches what we want, and then get its IP
      if (MDNS.hostname(i) == "raspberrypi") {
        String JENKINS_HOST = String(MDNS.IP(i)[0]) + String(".") +\
          String(MDNS.IP(i)[1]) + String(".") +\
          String(MDNS.IP(i)[2]) + String(".") +\
          String(MDNS.IP(i)[3]);
          JENKINS_HOST.toCharArray(MQTT_SERVER_IP, 16);
          Serial.println(JENKINS_HOST);
          Serial.println(MQTT_SERVER_IP);
      }
    }
  }
}


/************ OTA Setup ******************/
void setupOTA() {
    // OTA Setup
  ArduinoOTA.onStart([]() {
    Serial.println("INFO: starting OTA upload");
    digitalWrite(LED_BUILTIN, LOW);
  });

  ArduinoOTA.onEnd([]() {
    Serial.println("INFO: OTA upload successful");
    digitalWrite(LED_BUILTIN, HIGH);
  });

  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("INFO: upload %u%% complete\n", (progress / (total / 100)));
  });

  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("ERROR: OTA %u: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("OTA Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("OTA Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("OTA Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("OTA Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("OTA End Failed");
  });

  ArduinoOTA.begin();
  Serial.println("INFO: OTA ready");
}



/************ Arduino Setup ******************/
void setup() {
  // Set Serial Communication rate
  if (DEBUG) {
    Serial.begin(115200);
  }

  // init FastLED and the LED strip
  FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(map(brightness, 0, 100, 0, MAX_BRIGHTNESS));
  setColor(0, 0, 0);

  // init the builtin led on the ESP8266
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  
  // init the Wifi connection
  setupWifi();

  // init OTA firmware uploads
  setupOTA();

  // init the MQTT connection
  client.setServer(MQTT_SERVER_IP, MQTT_SERVER_PORT);
  client.setCallback(callback);
}



/************ Main Loop ******************/
long lastReconnectAttempt = 0;
void loop() {
  // Handle OTA requests
  ArduinoOTA.handle();

  // Handle MQTT connection
  if (!client.connected()) {
    long now = millis();
    if (now - lastReconnectAttempt > 5000) {
      Serial.println("INFO: attempting MQTT connection...");
      lastReconnectAttempt = now;
      // Attempt to reconnect
      if (reconnect()) {
        lastReconnectAttempt = 0;
      } else {
        Serial.print("ERROR: failed MQTT Connection, rc=");
        Serial.println(client.state());
        Serial.println("DEBUG: try again in 5 seconds");
      }
    }
  } else {
    client.loop();
  }
}
