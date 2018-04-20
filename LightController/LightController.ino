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
#include <ESP8266mDNS.h>
#include <DNSServer.h>            // Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h>     // Local WebServer used to serve the configuration portal
#include <ArduinoOTA.h>
#include <WiFiManager.h>          // https://github.com/tzapu/WiFiManager WiFi Configuration Magic
#include <PubSubClient.h>
#include <ArduinoJson.h>



/************ Data Global Variables ******************/
bool power = false;
int brightness = 0;
int r = 0;
int g = 0;
int b = 0;

/************ MQTT Setup Variables ******************/
const char* mqtt_server = "test.mosquitto.org";
WiFiClient espClient;
PubSubClient client(espClient);
const char* inTopic = "CHANGE_LIGHT_TOPIC";
const char* outTopic = "LIGHT_CHANGED_TOPIC";


/************ WIFI Setup ******************/
void setupWifi() {
  // Autoconnect to Wifi
  WiFiManager wifiManager;
  if (!wifiManager.autoConnect("Nick's Lightapp-ESP8266", "991f76a6ab")) {
    // (AP-Name, Password)
    Serial.println("Failed to connect, try resetting the module");
    delay(3000);
    ESP.reset();
    delay(5000);
  }
  Serial.println("Connected to Wifi :)");
}


/************ OTA Setup ******************/
void setupOTA() {
    // OTA Setup
  ArduinoOTA.onStart([]() {
    Serial.println("Start OTA");
    digitalWrite(LED_BUILTIN, LOW);
  });

  ArduinoOTA.onEnd([]() {
    Serial.println("End OTA");
    digitalWrite(LED_BUILTIN, HIGH);
  });

  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\n", (progress / (total / 100)));
  });

  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });

  ArduinoOTA.begin();
  Serial.println("OTA Ready");
}



/************ Arduino Setup ******************/
void setup() {
  // Set Serial Communication rate
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  
  // Setup Wifi
  setupWifi();

  // Setup OTA
  setupOTA();

  // Setup MQTT
  client.setServer(mqtt_server, 1883);
  client.setCallback(handleMessage);
}



/************ MQTT onMessage Callback Setup ******************/
void handleMessage(char* topic, byte* payload, unsigned int length) {
  
  // decode the JSON payload
  StaticJsonBuffer<128> jsonInBuffer;
  JsonObject& data = jsonInBuffer.parseObject(payload);
  
  // Print the received value to serial monitor for debugging
  /*
  Serial.print("Message of length ");
  Serial.print(length);
  Serial.print(" arrived on topic: [");
  Serial.print(topic);
  Serial.println("] ");
  data.prettyPrintTo(Serial);
  Serial.println("\n");
  */
  
  // Test if parsing succeeds.
  if (!data.success()) {
    Serial.println("ERROR: Unable to parse message");
    return;
  }

  // Set up JSON response objects
  StaticJsonBuffer<128> jsonOutBuffer;
  JsonObject& responsePayload = jsonOutBuffer.createObject();
  
  if (data.containsKey("power")) {
    power = data["power"];
    //Serial.print("Setting power to: ");
    //Serial.println(power);
    digitalWrite(LED_BUILTIN, power ? LOW : HIGH);
    responsePayload["power"] = power;
  }

  if (data.containsKey("brightness")) {
    brightness = data["brightness"];
    //Serial.print("Setting brightness to: ");
    //Serial.println(brightness);
    responsePayload["brightness"] = brightness;
  }

  if (data.containsKey("color")) {
    r = data["color"]["r"];
    g = data["color"]["g"];
    b = data["color"]["b"];
//    Serial.print("Setting color to: ");
//    Serial.print("r = ");
//    Serial.print(r);
//    Serial.print(", g = ");
//    Serial.print(g);
//    Serial.print(", b = ");
//    Serial.println(b);
    JsonObject& color = responsePayload.createNestedObject("color");
    color["r"] = r;
    color["g"] = g;
    color["b"] = b;
    responsePayload["color"] = color;
  }
  
//  Serial.print("payload Size: ");
//  Serial.println(responsePayload.size());
  Serial.println("payload: ");
  responsePayload.prettyPrintTo(Serial);
  Serial.println();
  
  if(responsePayload.size() > 0) {
    char responseChar[100];
    responsePayload.printTo((char*)responseChar, responsePayload.measureLength() + 1);
    //Serial.println(responseChar);
    client.publish(outTopic, responseChar);
  }

}



/************ MQTT reconnect function ******************/
long lastReconnectAttempt = 0;
boolean reconnect() {
  if (client.connect("arduinoClient")) {
    Serial.println("Connected");
    // Once connected, publish an announcement...
    client.publish("outTopic","hello world");
    // ... and resubscribe
    client.subscribe(inTopic);
  }
  return client.connected();
}



/************ Main Loop ******************/
void loop() {
  // Handle OTA requests
  ArduinoOTA.handle();

  // Handle MQTT connection
  if (!client.connected()) {
    long now = millis();
    if (now - lastReconnectAttempt > 5000) {
      Serial.println("Attempting to Connect to MQTT Broker");
      lastReconnectAttempt = now;
      // Attempt to reconnect
      if (reconnect()) {
        lastReconnectAttempt = 0;
      }
    }
  } else {
    client.loop();
  }
}
