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
#include "light.h"

#include <ESP8266WiFi.h>      // ESP8266 Core WiFi Library
#include <ESP8266mDNS.h>      // Enables finding addresses in the .local domain
#include <DNSServer.h>        // Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h> // Local WebServer used to serve the configuration portal
#include <ArduinoOTA.h>       // Update ESP8266 over wifi
#include <WiFiManager.h>      // https://github.com/tzapu/WiFiManager WiFi Configuration Magic
#include <PubSubClient.h>     // MQTT client library
#include <ArduinoJson.h>      // Parse JSON

Light light;

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
  if (lightName != NULL)
  {
    strcat(bufferVariable, lightName);
    strcat(bufferVariable, "/");
  }

  strcat(bufferVariable, topic);
}

// MQTT: topics
// TODO: either dynamically create the length of these arrays based on the length of the config variables or make them big and the code that uses them ignores the empty space
// connection
char MQTT_LIGHT_CONNECTED_TOPIC[50];
// effect list
char MQTT_EFFECT_LIST_TOPIC[50];
// state
char MQTT_LIGHT_STATE_TOPIC[50];
char MQTT_LIGHT_COMMAND_TOPIC[50];
// config
char MQTT_LIGHT_CONFIG_TOPIC[50];
// discovery
char MQTT_LIGHT_DISCOVERY_TOPIC[50];

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
unsigned int mutationId;
bool mutationIdWasChanged = false;

// Change to add effect ^^^^^

/************ Functions ******************/
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
  else if (strcmp(topic, MQTT_LIGHT_DISCOVERY_TOPIC) == 0)
  {
    sendConfig();
  }
  else
  {
    return;
  }

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
      light.setState(true);
    }
    else if (strcmp(root["state"], LIGHT_OFF) == 0)
    {
      light.setState(false);
    }
  }

  if (root.containsKey("color"))
  {
    light.setColorRGB(root["color"]["r"], root["color"]["g"], root["color"]["b"]);
  }

  if (root.containsKey("brightness"))
  {
    light.setBrightness(root["brightness"]);
  }

  if (root.containsKey("effect"))
  {
    int numEffects = light.getNumEffects();
    char** effects = light.getEffects();
    for (int i = 0; i < numEffects; i++)
    {
      if (strcmp(root["effect"], effects[i]) == 0)
      {
        // Set effect if it is supported on this controller
        light.setEffect(root["effect"].asString());

        // Clear current lights when Visualize effect is chosen
        if (strcmp(root["effect"], "Visualize") == 0)
        {
          Serial.println("INFO: Clearing light for visualization");
          light.setColorRGB(0, 0, 0);
        }

        break;
      }
    }
  }

  if (root.containsKey("speed"))
  {
    if (root["speed"] >= 1 && root["speed"] <= 7)
    {
      light.setEffectSpeed((int)root["speed"]);
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
  root["state"] = (light.getState()) ? LIGHT_ON : LIGHT_OFF;

  // populate payload with color
  JsonObject &color = root.createNestedObject("color");
  color["r"] = light.getColor().r;
  color["g"] = light.getColor().g;
  color["b"] = light.getColor().b;

  // populate payload with brightness
  root["brightness"] = light.getBrightness();

  // populate payload with current effect
  root["effect"] = light.getEffect();

  // populate payload with current effect speed
  root["speed"] = light.getEffectSpeed();

  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  client.publish(MQTT_LIGHT_STATE_TOPIC, buffer, true);
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
  char** effects = light.getEffects();
  int numEffects = light.getNumEffects();
  for (int i = 0; i < numEffects; i++)
  {
    effectList.add(effects[i]);
  }

  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  client.publish(MQTT_EFFECT_LIST_TOPIC, buffer, true);
}

// send effect list over MQTT (Debounce of 1 second)
long lastConfigUpdate = 0;
void sendConfig()
{
  long now = millis();
  if (now - lastConfigUpdate > 1000)
  {
    lastConfigUpdate = now;

    StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;

    JsonObject &root = jsonBuffer.createObject();

    // populate payload with name
    root["name"] = CONFIG_NAME;

    // populate payload with config properties
    root["ipAddress"] = WiFi.localIP().toString();
    root["macAddress"] = WiFi.macAddress();
    root["numLeds"] = CONFIG_NUM_LEDS;
    root["udpPort"] = light.getUdpPort();

    char buffer[root.measureLength() + 1];
    root.printTo(buffer, sizeof(buffer));

    client.publish(MQTT_LIGHT_CONFIG_TOPIC, buffer);
  }
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
    sendState();
    sendEffectList();

    // ... and resubscribe
    client.subscribe(MQTT_LIGHT_COMMAND_TOPIC);
    client.subscribe(HOMEKIT_LIGHT_COMMAND_TOPIC);
    client.subscribe(MQTT_LIGHT_DISCOVERY_TOPIC);
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
  createMqttTopic(MQTT_LIGHT_DISCOVERY_TOPIC, CONFIG_MQTT_TOP, NULL, CONFIG_MQTT_DISCOVERY);

  // init the light
  light.setBrightness(100);
  light.setState(false);

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

  light.playEffect();
}
