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

#include "config.h"

#include <ESP8266WiFi.h>         // ESP8266 Core WiFi Library
#include <ESP8266mDNS.h>         // Enables finding addresses in the .local domain
#include <DNSServer.h>           // Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h>    // Local WebServer used to serve the configuration portal
#include <ArduinoOTA.h>          // Update ESP8266 over wifi
#include <WiFiManager.h>         // https://github.com/tzapu/WiFiManager WiFi Configuration Magic
#include <PubSubClient.h>        // MQTT client library
#include <ArduinoJson.h>         // Parse JSON
#define FASTLED_ESP8266_DMA      // better control for ESP8266 will output or RX pin requires fork https://github.com/coryking/FastLED
#include "src/FastLED/FastLED.h" // LED strip control library

// Search "Change to add effect" to find all areas you need to edit to add an effect

/************ MQTT Setup Variables ******************/
// MQTT: ID, server IP, port, username and password
const PROGMEM char *MQTT_CLIENT_ID = CONFIG_NAME;
char MQTT_SERVER_IP[16];
const PROGMEM uint16_t MQTT_SERVER_PORT = CONFIG_MQTT_SERVER_PORT;
const PROGMEM char *MQTT_USER = CONFIG_MQTT_USER;
const PROGMEM char *MQTT_PASSWORD = CONFIG_MQTT_PASSWORD;

void createMqttTopic(char *bufferVariable, char *topLevel, char *lightName, char *topic)
{
  strcpy(bufferVariable, topLevel);
  strcat(bufferVariable, "/");
  strcat(bufferVariable, lightName);
  strcat(bufferVariable, "/");
  strcat(bufferVariable, topic);
}

// MQTT: topics
// TODO: either dynamically create the length of these arrays based on the length of the config variables or make them big and the code that uses them ignores the empty space
// connection
char MQTT_LIGHT_CONNECTED_TOPIC[36];
// effect list
char MQTT_EFFECT_LIST_TOPIC[34];
// state
char MQTT_LIGHT_STATE_TOPIC[32];
char MQTT_LIGHT_COMMAND_TOPIC[34];
// config
char MQTT_LIGHT_CONFIG_TOPIC[33];

// homebridge
char *HOMEKIT_LIGHT_STATE_TOPIC = "lightapp2/to/set";
char *HOMEKIT_LIGHT_COMMAND_TOPIC = "lightapp2/from/set";

// payloads by default (on/off)
const PROGMEM char *LIGHT_ON = "ON";
const PROGMEM char *LIGHT_OFF = "OFF";
const PROGMEM char *LIGHT_CONNECTED = "2";
const PROGMEM char *LIGHT_DISCONNECTED = "0";

// buffer used to send/receive data with MQTT
const uint8_t MSG_BUFFER_SIZE = 20;
char m_msg_buffer[MSG_BUFFER_SIZE];

WiFiClient wifiClient;
PubSubClient client(wifiClient);

// Make this bigger if you need to add more objects to the json
// Also make sure MQTT_MAX_PACKET_SIZE in PubSubClient.h is big enough
const int BUFFER_SIZE = JSON_OBJECT_SIZE(20);

/************ Data Global Variables ******************/
// variables used to store the state, the brightness and the color of the light
boolean stateOn = false;
uint8_t brightness = 100;
uint8_t red = 255;
uint8_t green = 0;
uint8_t blue = 0;
int animationSpeed = 4;
#define NO_EFFECT "None"
String currentEffect = NO_EFFECT;
char *effects[] = {"Flash", "Fade", "Rainbow", "Cylon", "Sinelon", "Confetti", "BPM", "Juggle", "Visualize"}; // Change to add effect
int numEffects = 9;                                                                                           // Change to add effect
unsigned int mutationId;
bool mutationIdWasChanged = false;

// define the array of leds
CRGB leds[CONFIG_NUM_LEDS];

// Homekit variables
int hue = 0;
int saturation = 100;
bool setHomekitOn = false;
bool setHomekitBrightness = false;
bool setHomekitHue = false;
bool setHomekitSaturation = false;

// Real values to write to the LEDs (ex. including brightness and state)
byte realRed = 0;
byte realGreen = 0;
byte realBlue = 0;

// Globals for fade/transitions
bool startFade = false;
unsigned long lastLoop = 0;
int transitionTime = 0; // Set to 0 for instant color changes
bool inFade = false;
int loopCount = 0;
int stepR, stepG, stepB;
int redVal, grnVal, bluVal;

// Globals for animations
bool wasInEffect = false;

// Flash
byte flash_index = 0;

// Fade
byte gHue = 0;

// Cylon
int LED = 0;
bool forward = true;

// Visualize
const int udp_port = 7778;
WiFiUDP port;

// Change to add effect ^^^^^

/************ Functions ******************/
// function called to fill the LED strip a solid color
void setRGB(uint8_t p_red, uint8_t p_green, uint8_t p_blue)
{
  fill_solid(leds, CONFIG_NUM_LEDS, CRGB(p_red, p_green, p_blue));
  FastLED.show();
}

void setHSV(uint8_t p_hue, uint8_t p_saturation, uint8_t p_value)
{
  fill_solid(leds, CONFIG_NUM_LEDS, CHSV(p_hue, p_saturation, p_value));
  FastLED.show();
}

// function called when a MQTT message arrived
void callback(char *topic, byte *payload, unsigned int length)
{
  Serial.print("INFO: Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  char message[length + 1];
  for (int i = 0; i < length; i++)
  {
    message[i] = (char)payload[i];
  }
  message[length] = '\0';

  Serial.println(message);
  if (strcmp(topic, MQTT_LIGHT_COMMAND_TOPIC) == 0)
  {
    if (!processJson(message))
    {
      return;
    }
  }
  else if (strcmp(topic, HOMEKIT_LIGHT_COMMAND_TOPIC) == 0)
  {
    if (!processHomekitJson(message))
    {
      return;
    }
  }
  else
  {
    return;
  }

  if (stateOn)
  {
    // Update lights
    realRed = red;
    realGreen = green;
    realBlue = blue;
  }
  else
  {
    realRed = 0;
    realGreen = 0;
    realBlue = 0;
  }

  startFade = true;
  inFade = false; // Kill the current fade
  sendState();
}

// function called to take JSON message, parse it, then set the according variables
bool processJson(char *message)
{
  StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;

  JsonObject &root = jsonBuffer.parseObject(message);

  if (!root.success())
  {
    Serial.println("ERROR: parseObject() failed");
    return false;
  }

  if (root.containsKey("name"))
  {
    if (strcmp(root["name"], CONFIG_NAME) != 0)
    {
      Serial.println("DEBUG: Message was for different light");
      return true;
    }
  }

  if (root.containsKey("state"))
  {
    if (strcmp(root["state"], LIGHT_ON) == 0)
    {
      stateOn = true;
    }
    else if (strcmp(root["state"], LIGHT_OFF) == 0)
    {
      stateOn = false;
    }
    setHomekitOn = true;
  }

  if (root.containsKey("color"))
  {
    // Turn the light on if it isn't
    if (!stateOn)
    {
      stateOn = true;
      setHomekitOn = true;
    }

    // Set the current effect to None
    if (currentEffect != NO_EFFECT)
    {
      currentEffect = NO_EFFECT;
      wasInEffect = true;
    }

    // Set the color variables
    red = root["color"]["r"];
    green = root["color"]["g"];
    blue = root["color"]["b"];
  }

  if (root.containsKey("brightness"))
  {
    brightness = root["brightness"];
    FastLED.setBrightness(map(brightness, 0, 100, 0, CONFIG_MAX_BRIGHTNESS));
    FastLED.show();
    setHomekitBrightness = true;
  }
  /*
  if (root.containsKey("transition")) {
    transitionTime = root["transition"];
  }
  */

  if (root.containsKey("effect"))
  {
    for (int i = 0; i < numEffects; i++)
    {
      if (strcmp(root["effect"], effects[i]) == 0)
      {
        // Set effect if it is supported on this controller
        if (!stateOn)
        {
          stateOn = true;
          setHomekitOn = true;
        }
        if (red != 0 || green != 0 || blue != 0)
        {
          red = 0;
          green = 0;
          blue = 0;
        }
        currentEffect = root["effect"].asString();

        // Clear current lights when Visualize effect is chosen
        if (strcmp(root["effect"], "Visualize") == 0)
        {
          Serial.println("INFO: Clearing light for visualization");
          setRGB(0, 0, 0);
        }

        break;
      }
    }
  }

  if (root.containsKey("speed"))
  {
    if (root["speed"] >= 1 && root["speed"] <= 7)
    {
      animationSpeed = (int)root["speed"];
    }
  }

  if (root.containsKey("mutationId"))
  {
    if (root["mutationId"] != mutationId)
    {
      mutationId = root["mutationId"];
      mutationIdWasChanged = true;
    }
  }

  return true;
}

// function called to take Homekit JSON message, parse it, then set the according variables
bool processHomekitJson(char *message)
{
  StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;

  JsonObject &root = jsonBuffer.parseObject(message);

  if (!root.success())
  {
    Serial.println("ERROR: parseObject() failed");
    return false;
  }

  if (root.containsKey("name"))
  {
    if (strcmp(root["name"], CONFIG_NAME) != 0)
    {
      Serial.println("DEBUG: Message was for different light");
      return true;
    }
  }

  if (root.containsKey("characteristic"))
  {
    if (strcmp(root["characteristic"], "On") == 0)
    {
      if (root.containsKey("value"))
      {
        if (root["value"])
        {
          stateOn = true;
        }
        else
        {
          stateOn = false;
        }
        setHomekitOn = true;
      }
    }
    else if (strcmp(root["characteristic"], "Brightness") == 0)
    {
      if (root.containsKey("value"))
      {
        if (root["value"])
        {
          brightness = root["value"];
          FastLED.setBrightness(map(brightness, 0, 100, 0, CONFIG_MAX_BRIGHTNESS));
          FastLED.show();
          setHomekitBrightness = true;
        }
      }
    }
    else if (strcmp(root["characteristic"], "Hue") == 0)
    {
      if (root.containsKey("value"))
      {
        if (root["value"])
        {
          hue = root["value"];
          CRGB color = CHSV(map(hue, 0, 359, 0, 255), map(saturation, 0, 100, 0, 255), 255);
          // Turn the light on if it isn't
          if (!stateOn)
          {
            stateOn = true;
            setHomekitOn = true;
          }

          // Set the current effect to None
          if (currentEffect != NO_EFFECT)
          {
            currentEffect = NO_EFFECT;
            wasInEffect = true;
          }

          // Set the color variables
          red = color.r;
          green = color.g;
          blue = color.b;
          setHomekitHue = true;
        }
      }
    }
    else if (strcmp(root["characteristic"], "Saturation") == 0)
    {
      if (root.containsKey("value"))
      {
        if (root["value"])
        {
          saturation = root["value"];
          CRGB color = CHSV(map(hue, 0, 359, 0, 255), map(saturation, 0, 100, 0, 255), 255);
          // Turn the light on if it isn't
          if (!stateOn)
          {
            stateOn = true;
            setHomekitOn = true;
          }

          // Set the current effect to None
          if (currentEffect != NO_EFFECT)
          {
            currentEffect = NO_EFFECT;
            wasInEffect = true;
          }

          // Set the color variables
          red = color.r;
          green = color.g;
          blue = color.b;
          setHomekitSaturation = true;
        }
      }
    }
  }

  return true;
}

// send light state over MQTT
void sendState()
{
  StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;

  JsonObject &root = jsonBuffer.createObject();

  // populate payload with mutationId if one was sent
  if (mutationIdWasChanged)
  {
    root["mutationId"] = mutationId;
  }

  // populate payload with name
  root["name"] = CONFIG_NAME;

  // populate payload with state
  root["state"] = (stateOn) ? LIGHT_ON : LIGHT_OFF;

  // populate payload with color
  JsonObject &color = root.createNestedObject("color");
  color["r"] = red;
  color["g"] = green;
  color["b"] = blue;

  // populate payload with brightness
  root["brightness"] = brightness;

  // populate payload with current effect
  root["effect"] = currentEffect;

  // populate payload with current effect speed
  root["speed"] = animationSpeed;

  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  client.publish(MQTT_LIGHT_STATE_TOPIC, buffer, true);
  if (setHomekitOn)
  {
    setHomekitOn = false;
    sendHomekitState("On");
  }
  if (setHomekitBrightness)
  {
    setHomekitBrightness = false;
    sendHomekitState("Brightness");
  }
}

// send light state over MQTT
void sendHomekitState(char *characteristic)
{
  StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;

  JsonObject &root = jsonBuffer.createObject();

  // populate payload with name
  root["name"] = CONFIG_NAME;

  // populate payload with service_name
  root["service_name"] = CONFIG_NAME;

  // populate payload with characteristic
  root["characteristic"] = characteristic;

  // populate payload with characteristic
  if (strcmp(root["characteristic"], "On") == 0)
  {
    root["value"] = stateOn;
  }
  else if (strcmp(root["characteristic"], "Brightness") == 0)
  {
    root["value"] = brightness;
  }
  else if (strcmp(root["characteristic"], "Hue") == 0)
  {
    root["value"] = hue;
  }
  else if (strcmp(root["characteristic"], "Saturation") == 0)
  {
    root["value"] = saturation;
  }

  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  Serial.println(buffer);
  client.publish(HOMEKIT_LIGHT_STATE_TOPIC, buffer, true);
}

// send effect list over MQTT
void sendEffectList()
{
  StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;

  JsonObject &root = jsonBuffer.createObject();

  // populate payload with name
  root["name"] = CONFIG_NAME;

  // populate payload with effect list
  JsonArray &effectList = root.createNestedArray("effectList");
  for (int i = 0; i < numEffects; i++)
  {
    effectList.add(effects[i]);
  }

  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  client.publish(MQTT_EFFECT_LIST_TOPIC, buffer, true);
}

// send effect list over MQTT
void sendConfig()
{
  StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;

  JsonObject &root = jsonBuffer.createObject();

  // populate payload with name
  root["name"] = CONFIG_NAME;

  // populate payload with config properties
  root["ipAddress"] = WiFi.localIP().toString();
  root["macAddress"] = WiFi.macAddress();
  root["numLeds"] = CONFIG_NUM_LEDS;
  root["udpPort"] = udp_port;

  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  client.publish(MQTT_LIGHT_CONFIG_TOPIC, buffer, true);
}

// MQTT connect/reconnect function
boolean reconnect()
{
  setMqttIpWithMDNS();

  // Set up connection state payload
  StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;
  JsonObject &root = jsonBuffer.createObject();
  // populate payload with name
  root["name"] = CONFIG_NAME;
  // populate payload with connection status
  root["connection"] = LIGHT_DISCONNECTED;
  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  if (client.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD, MQTT_LIGHT_CONNECTED_TOPIC, 0, true, buffer))
  {
    Serial.println("INFO: connected to MQTT broker");

    // Once connected, publish an announcement...
    // publish that the ESP is connected

    // populate payload with new connection status
    root["connection"] = LIGHT_CONNECTED;
    char buffer[root.measureLength() + 1];
    root.printTo(buffer, sizeof(buffer));

    client.publish(MQTT_LIGHT_CONNECTED_TOPIC, buffer, true);

    // publish the initial values
    setHomekitOn = true;
    setHomekitBrightness = true;
    setHomekitHue = true;
    setHomekitSaturation = true;
    sendState();
    sendEffectList();
    sendConfig();

    // ... and resubscribe
    client.subscribe(MQTT_LIGHT_COMMAND_TOPIC);
    client.subscribe(HOMEKIT_LIGHT_COMMAND_TOPIC);
  }
  return client.connected();
}

/************ WIFI Setup ******************/
void setupWifi()
{
  // Autoconnect to Wifi
  WiFiManager wifiManager;

// Set static IP address if one is provided
#ifdef STATIC_IP
  Serial.print("INFO: adding static IP ");
  Serial.println(STATIC_IP);
  IPAddress _ip, _gw, _sn;
  _ip.fromString(STATIC_IP);
  _gw.fromString(STATIC_GW);
  _sn.fromString(STATIC_SN);
  wifiManager.setSTAStaticIPConfig(_ip, _gw, _sn);
#endif

  if (!wifiManager.autoConnect(CONFIG_NAME, CONFIG_WIFI_MANAGER_PW))
  {
    // (AP-Name, Password)
    Serial.println("ERROR: failed to connect to Wifi");
    Serial.println("DEBUG: try resetting the module");
    delay(3000);
    ESP.reset();
    delay(5000);
  }
  Serial.println("INFO: connected to Wifi :)");
}

/************ Find MDNS name of MQTT server ******************/
void setMqttIpWithMDNS()
{
  char hostString[16] = {0};
  int n = MDNS.queryService("mqtt", "tcp");
  if (n == 0)
  {
    Serial.println("INFO: no services found");
  }
  else
  {
    for (int i = 0; i < n; ++i)
    {
      // Going through every available service,
      // we're searching for the one whose hostname
      // matches what we want, and then get its IP
      if (MDNS.hostname(i) == CONFIG_MDNS_HOSTNAME)
      {
        String MQTT_HOST = String(MDNS.IP(i)[0]) + String(".") +
                           String(MDNS.IP(i)[1]) + String(".") +
                           String(MDNS.IP(i)[2]) + String(".") +
                           String(MDNS.IP(i)[3]);
        Serial.print("INFO: MQTT Host IP: ");
        Serial.println(MQTT_HOST);
        // Set MQTT_SERVER_IP to MQTT_HOST
        MQTT_HOST.toCharArray(MQTT_SERVER_IP, 16);
      }
    }
  }
}

/************ OTA Setup ******************/
void setupOTA()
{
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
    if (error == OTA_AUTH_ERROR)
      Serial.println("OTA Auth Failed");
    else if (error == OTA_BEGIN_ERROR)
      Serial.println("OTA Begin Failed");
    else if (error == OTA_CONNECT_ERROR)
      Serial.println("OTA Connect Failed");
    else if (error == OTA_RECEIVE_ERROR)
      Serial.println("OTA Receive Failed");
    else if (error == OTA_END_ERROR)
      Serial.println("OTA End Failed");
  });

  ArduinoOTA.setHostname(CONFIG_NAME);
  ArduinoOTA.setPassword(CONFIG_OTA_PASSWORD);
  ArduinoOTA.begin();
  Serial.println("INFO: OTA ready");
}

/************ Arduino Setup ******************/
void setup()
{
  // Set Serial Communication rate
  if (CONFIG_DEBUG)
  {
    Serial.begin(115200);
  }

  // Create MQTT topic strings
  createMqttTopic(MQTT_LIGHT_CONNECTED_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_CONNECTION);
  createMqttTopic(MQTT_EFFECT_LIST_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_EFFECT_LIST);
  createMqttTopic(MQTT_LIGHT_STATE_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_STATE);
  createMqttTopic(MQTT_LIGHT_COMMAND_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_COMMAND);
  createMqttTopic(MQTT_LIGHT_CONFIG_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_CONFIG);

  // init FastLED and the LED strip
  FastLED.addLeds<CONFIG_CHIPSET, CONFIG_DATA_PIN, CONFIG_COLOR_ORDER>(leds, CONFIG_NUM_LEDS);
  FastLED.setBrightness(map(brightness, 0, 100, 0, CONFIG_MAX_BRIGHTNESS));
  setRGB(0, 0, 0);

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

  // init the UDP port
  port.begin(udp_port);
}

/************ Crossfade transition function ******************/
void handleColorChange()
{
  if (startFade)
  {
    // TODO: Clean up logic
    if (currentEffect != NO_EFFECT && stateOn)
    {
      return;
    }
    if (transitionTime == 0 || currentEffect != NO_EFFECT || wasInEffect)
    {
      if (wasInEffect)
      {
        wasInEffect = false;
      }
      setRGB(realRed, realGreen, realBlue);

      redVal = realRed;
      grnVal = realGreen;
      bluVal = realBlue;

      startFade = false;
    }
    else
    {
      loopCount = 0;
      stepR = calculateStep(redVal, realRed);
      stepG = calculateStep(grnVal, realGreen);
      stepB = calculateStep(bluVal, realBlue);

      inFade = true;
    }
  }

  if (inFade)
  {
    startFade = false;
    unsigned long now = millis();
    if (now - lastLoop > transitionTime)
    {
      if (loopCount <= 255)
      {
        lastLoop = now;

        redVal = calculateVal(stepR, redVal, loopCount);
        grnVal = calculateVal(stepG, grnVal, loopCount);
        bluVal = calculateVal(stepB, bluVal, loopCount);

        setRGB(redVal, grnVal, bluVal); // Write current values to LED pins

        Serial.print("Loop count: ");
        Serial.println(loopCount);
        loopCount++;
      }
      else
      {
        inFade = false;
      }
    }
  }
}

/************ Main Loop ******************/
long lastReconnectAttempt = 0;
void loop()
{
  // Handle OTA requests
  ArduinoOTA.handle();

  // Handle MQTT connection
  if (!client.connected())
  {
    long now = millis();
    if (now - lastReconnectAttempt > 5000)
    {
      Serial.println("INFO: attempting MQTT connection...");
      lastReconnectAttempt = now;
      // Attempt to reconnect
      if (reconnect())
      {
        lastReconnectAttempt = 0;
      }
      else
      {
        Serial.print("ERROR: failed MQTT Connection, rc=");
        Serial.println(client.state());
        Serial.println("DEBUG: try again in 5 seconds");
      }
    }
  }
  else
  {
    client.loop();
  }

  // Handles crossfading between colors/setting the color through the colorpicker
  handleColorChange();

  // Handle parsing the UDP packets for visualizations
  int packetSize = port.parsePacket(); // Read data over socket

  // Handle the current effect
  if (currentEffect == NO_EFFECT || stateOn == false)
  { // Change to add effect
    // do nothing
  }
  else if (currentEffect == "Flash")
  {
    handleFlash();
  }
  else if (currentEffect == "Fade")
  {
    handleFade();
  }
  else if (currentEffect == "Rainbow")
  {
    handleRainbow();
  }
  else if (currentEffect == "Confetti")
  {
    handleConfetti();
  }
  else if (currentEffect == "Cylon")
  {
    handleCylon();
  }
  else if (currentEffect == "Juggle")
  {
    handleJuggle();
  }
  else if (currentEffect == "BPM")
  {
    handleBPM();
  }
  else if (currentEffect == "Sinelon")
  {
    handleSinelon();
  }
  else if (currentEffect == "Visualize")
  {
    handleVisualize(packetSize);
  }
}

/************ Animations ******************/
int getFlashSpeed()
{
  switch (animationSpeed)
  {
  case 1:
    return 2000;
    break;
  case 2:
    return 1000;
    break;
  case 3:
    return 500;
    break;
  case 4:
    return 300;
    break;
  case 5:
    return 200;
    break;
  case 6:
    return 100;
    break;
  case 7:
    return 50;
    break;
  default:
    return 1000;
  }
}

int getCycleSpeed()
{
  switch (animationSpeed)
  {
  case 1:
    return 100;
    break;
  case 2:
    return 50;
    break;
  case 3:
    return 33;
    break;
  case 4:
    return 17;
    break;
  case 5:
    return 8;
    break;
  case 6:
    return 5;
    break;
  case 7:
    return 3;
    break;
  default:
    return 33;
  }
}

//CYCLE HUE
long lastHueCycle = 0;
void cycleHue()
{
  gHue++;
}

long lastUpdate = 0;
bool shouldUpdate()
{
  long updateThreshold;
  if (currentEffect == "Flash")
  {
    updateThreshold = getFlashSpeed();
  }
  else
  {
    updateThreshold = getCycleSpeed();
  }
  long now = millis();

  if (now - lastUpdate > updateThreshold)
  {
    lastUpdate = now;
    return true;
  }
  return false;
}

// Flash
void handleFlash()
{
  if (shouldUpdate())
  {
    if (flash_index == 0)
    {
      setRGB(255, 0, 0);
      flash_index++;
    }
    else if (flash_index == 1)
    {
      setRGB(0, 255, 0);
      flash_index++;
    }
    else
    {
      setRGB(0, 0, 255);
      flash_index = 0;
    }
  }
}

// Fade
void handleFade()
{
  if (shouldUpdate())
  {
    cycleHue();
    setHSV(gHue, 255, 255);
  }
}

// Rainbow
void handleRainbow()
{
  if (shouldUpdate())
  {
    cycleHue();
    fill_rainbow(leds, CONFIG_NUM_LEDS, gHue, 7);
    FastLED.show();
  }
}

// Confetti
void handleConfetti()
{
  if (shouldUpdate())
  {
    cycleHue();
    fadeToBlackBy(leds, CONFIG_NUM_LEDS, 10);
    int pos = random16(CONFIG_NUM_LEDS);
    leds[pos] += CHSV(gHue + random8(64), 200, 255);
    FastLED.show();
  }
}

// Cylon
void fadeall()
{
  for (int i = 0; i < CONFIG_NUM_LEDS; i++)
  {
    leds[i].nscale8(247);
  }
}

void handleCylon()
{
  if (shouldUpdate())
  {
    cycleHue();
    fadeall();
    // First slide the led in one direction
    if (LED >= CONFIG_NUM_LEDS - 1)
    {
      forward = false;
    }
    else if (LED <= 0)
    {
      forward = true;
    }
    if (forward)
    {
      LED++;
    }
    else
    {
      LED--;
    }
    leds[LED] = CHSV(gHue, 255, 255);
    FastLED.show();
  }
}

// Juggle
void handleJuggle()
{
  if (shouldUpdate())
  {
    // eight colored dots, weaving in and out of sync with each other
    fadeToBlackBy(leds, CONFIG_NUM_LEDS, 20);
    byte dothue = 0;
    for (int i = 0; i < 8; i++)
    {
      leds[beatsin16(i + 7, 0, CONFIG_NUM_LEDS - 1)] |= CHSV(dothue, 200, 255);
      dothue += 32;
    }
    FastLED.show();
  }
}

// BPM
int getBPM()
{
  switch (animationSpeed)
  {
  case 1:
    return 10;
    break;
  case 2:
    return 15;
    break;
  case 3:
    return 30;
    break;
  case 4:
    return 60;
    break;
  case 5:
    return 90;
    break;
  case 6:
    return 120;
    break;
  case 7:
    return 150;
    break;
  default:
    return 180;
  }
}

void handleBPM()
{
  if (shouldUpdate())
  {
    cycleHue();
    // colored stripes pulsing at a defined Beats-Per-Minute (BPM)
    uint8_t BeatsPerMinute = getBPM();
    CRGBPalette16 palette = PartyColors_p;
    uint8_t beat = beatsin8(BeatsPerMinute, 64, 255);
    for (int i = 0; i < CONFIG_NUM_LEDS; i++)
    { //9948
      leds[i] = ColorFromPalette(palette, gHue + (i * 2), beat - gHue + (i * 10));
    }
    FastLED.show();
  }
}

void handleSinelon()
{
  if (shouldUpdate())
  {
    cycleHue();
    fadeToBlackBy(leds, CONFIG_NUM_LEDS, 20);
    int pos = beatsin16((int)(getBPM() / 5), 0, CONFIG_NUM_LEDS - 1);
    leds[pos] += CHSV(gHue, 255, 192);
    FastLED.show();
  }
}

void handleVisualize(int packetSize)
{
  if (packetSize == sizeof(leds))
  {
    port.read((char *)leds, sizeof(leds));
    FastLED.show();
  }
  else if (packetSize)
  {
    Serial.printf("Invalid packet size: %u (expected %u)\n", packetSize, sizeof(leds));
    port.flush();
    return;
  }
}

// Change to add effect

// From https://www.arduino.cc/en/Tutorial/ColorCrossfader
/* BELOW THIS LINE IS THE MATH -- YOU SHOULDN'T NEED TO CHANGE THIS FOR THE BASICS
*
* The program works like this:
* Imagine a crossfade that moves the red LED from 0-10,
*   the green from 0-5, and the blue from 10 to 7, in
*   ten steps.
*   We'd want to count the 10 steps and increase or
*   decrease color values in evenly stepped increments.
*   Imagine a + indicates raising a value by 1, and a -
*   equals lowering it. Our 10 step fade would look like:
*
*   1 2 3 4 5 6 7 8 9 10
* R + + + + + + + + + +
* G   +   +   +   +   +
* B     -     -     -
*
* The red rises from 0 to 10 in ten steps, the green from
* 0-5 in 5 steps, and the blue falls from 10 to 7 in three steps.
*
* In the real program, the color percentages are converted to
* 0-255 values, and there are 255 steps (255*4).
*
* To figure out how big a step there should be between one up- or
* down-tick of one of the LED values, we call calculateStep(),
* which calculates the absolute gap between the start and end values,
* and then divides that gap by 255 to determine the size of the step
* between adjustments in the value.
*/
int calculateStep(int prevValue, int endValue)
{
  int step = endValue - prevValue; // What's the overall gap?
  if (step)
  {                    // If its non-zero,
    step = 255 / step; //   divide by 255
  }

  return step;
}

/* The next function is calculateVal. When the loop value, i,
*  reaches the step size appropriate for one of the
*  colors, it increases or decreases the value of that color by 1.
*  (R, G, and B are each calculated separately.)
*/
int calculateVal(int step, int val, int i)
{
  if ((step) && i % step == 0)
  { // If step is non-zero and its time to change a value,
    if (step > 0)
    { //   increment the value if step is positive...
      val += 1;
    }
    else if (step < 0)
    { //   ...or decrement it if step is negative
      val -= 1;
    }
  }

  // Defensive driving: make sure val stays in the range 0-255
  if (val > 255)
  {
    val = 255;
  }
  else if (val < 0)
  {
    val = 0;
  }

  return val;
}
