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

//*******************************************************
// WiFi Setup
//*******************************************************
WiFiClient wifiClient;
WiFiUDP port;
const int _UDP_PORT = 7778;

// WIFI Setup
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

//*******************************************************
// OTA Setup
//*******************************************************
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

//*******************************************************
// MQTT Setup
//*******************************************************
// client info
PubSubClient client(wifiClient);
const char *MQTT_CLIENT_ID = CONFIG_NAME;
char MQTT_SERVER_IP[16];
const uint16_t MQTT_SERVER_PORT = CONFIG_MQTT_SERVER_PORT;
const char *MQTT_USER = CONFIG_MQTT_USER;
const char *MQTT_PASSWORD = CONFIG_MQTT_PASSWORD;

// get the Mqtt broker's ip address
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

// topics
char MQTT_LIGHT_CONNECTED_TOPIC[50]; // for sending connection messages
char MQTT_EFFECT_LIST_TOPIC[50];     // for sending the effect list
char MQTT_LIGHT_STATE_TOPIC[50];     // for sending the state
char MQTT_LIGHT_COMMAND_TOPIC[50];   // for receiving commands
char MQTT_LIGHT_CONFIG_TOPIC[50];    // for sending config info
char MQTT_LIGHT_DISCOVERY_TOPIC[50]; // to know when to send config info

// homebridge
char *HOMEKIT_LIGHT_STATE_TOPIC = "prysmalight/to/set";
char *HOMEKIT_LIGHT_COMMAND_TOPIC = "prysmalight/from/set";

// payloads
const char *LIGHT_ON = "ON";
const char *LIGHT_OFF = "OFF";
const char *LIGHT_CONNECTED = "2";
const char *LIGHT_DISCONNECTED = "0";

// send/receive buffer
// Make this bigger if you need to add more objects to the json
// Also make sure MQTT_MAX_PACKET_SIZE in PubSubClient.h is big enough
const int BUFFER_SIZE = JSON_OBJECT_SIZE(20);

// MQTT Setup
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
void setupMqtt()
{
  // Create MQTT topic strings
  createMqttTopic(MQTT_LIGHT_CONNECTED_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_CONNECTION);
  createMqttTopic(MQTT_EFFECT_LIST_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_EFFECT_LIST);
  createMqttTopic(MQTT_LIGHT_STATE_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_STATE);
  createMqttTopic(MQTT_LIGHT_COMMAND_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_COMMAND);
  createMqttTopic(MQTT_LIGHT_CONFIG_TOPIC, CONFIG_MQTT_TOP, CONFIG_NAME, CONFIG_MQTT_CONFIG);
  createMqttTopic(MQTT_LIGHT_DISCOVERY_TOPIC, CONFIG_MQTT_TOP, NULL, CONFIG_MQTT_DISCOVERY);

  // init the MQTT connection
  client.setServer(MQTT_SERVER_IP, MQTT_SERVER_PORT);
  client.setCallback(callback);
}

//*******************************************************
// MQTT Functions
//*******************************************************
unsigned int mutationId;
bool mutationIdWasChanged = false;

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

// function called when a MQTT message arrives
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
  else if (strcmp(topic, MQTT_LIGHT_DISCOVERY_TOPIC) == 0)
  {
    sendConfig();
    return;
  }
  else
  {
    return;
  }

  sendState();
}

// Parse the JSON message
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
    char **effects = light.getEffects();
    for (int i = 0; i < numEffects; i++)
    {
      if (strcmp(root["effect"], effects[i]) == 0)
      {
        // Set effect if it is supported on this controller
        light.setEffect(root["effect"].asString());
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

  // Send homekit state
  sendHomekitState("On");
  sendHomekitState("Brightness");
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
  char **effects = light.getEffects();
  int numEffects = light.getNumEffects();
  for (int i = 0; i < numEffects; i++)
  {
    effectList.add(effects[i]);
  }

  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  client.publish(MQTT_EFFECT_LIST_TOPIC, buffer, true);
}

// send config over MQTT (Debounce of 1 second)
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
    root["udpPort"] = _UDP_PORT;

    char buffer[root.measureLength() + 1];
    root.printTo(buffer, sizeof(buffer));

    client.publish(MQTT_LIGHT_CONFIG_TOPIC, buffer);
  }
}

//*******************************************************
// Homekit Functions
//*******************************************************
// function called to take Homekit JSON message, parse it, then set the according variables
int currentHue = 0;
int currentSaturation = 0;
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
          light.setState(true);
        }
        else
        {
          light.setState(false);
        }
      }
    }
    else if (strcmp(root["characteristic"], "Brightness") == 0)
    {
      if (root.containsKey("value"))
      {
        if (root["value"])
        {
          light.setBrightness(root["value"]);
        }
      }
    }
    else if (strcmp(root["characteristic"], "Hue") == 0)
    {
      if (root.containsKey("value"))
      {
        if (root["value"] || root["value"] == 0)
        {
          currentHue = root["value"];
          light.setColorHSV(map(currentHue, 0, 359, 0, 255), map(currentSaturation, 0, 100, 0, 255), 255);
        }
      }
    }
    else if (strcmp(root["characteristic"], "Saturation") == 0)
    {
      if (root.containsKey("value"))
      {
        if (root["value"] || root["value"] == 0)
        {
          currentSaturation = root["value"];
          light.setColorHSV(map(currentHue, 0, 359, 0, 255), map(currentSaturation, 0, 100, 0, 255), 255);
        }
      }
    }
  }

  return true;
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
    root["value"] = light.getState();
  }
  else if (strcmp(root["characteristic"], "Brightness") == 0)
  {
    root["value"] = light.getBrightness();
  }
  else if (strcmp(root["characteristic"], "Hue") == 0)
  {
    root["value"] = currentHue;
  }
  else if (strcmp(root["characteristic"], "Saturation") == 0)
  {
    root["value"] = currentSaturation;
  }

  char buffer[root.measureLength() + 1];
  root.printTo(buffer, sizeof(buffer));

  Serial.println(buffer);
  client.publish(HOMEKIT_LIGHT_STATE_TOPIC, buffer, true);
}

//*******************************************************
// Arduino Functions
//*******************************************************
// Setup
void setup()
{

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

  // init the Mqtt client
  setupMqtt();

  // Init visualization listening
  port.begin(_UDP_PORT); // Setup
}

// Loop
long lastReconnectAttempt = 0;
void loop()
{
  // Handle OTA requests
  ArduinoOTA.handle();

  // Handle reading visualization data
  // This has to be in the main LightController.ino file or else it doesnt work for some reason
  // TODO: Figure out reason
  int packetSize = port.parsePacket(); // Read data over socket

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

  light.loop(packetSize, port);
}
