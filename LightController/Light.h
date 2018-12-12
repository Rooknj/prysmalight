/*
  Light.h - Library for making the LED strip do something.
  Created by Nick Rook
*/
#ifndef Light_h
#define Light_h

#include "Arduino.h"
#include "config.h"

#define FASTLED_ESP8266_DMA // better control for ESP8266 will output or RX pin requires fork https://github.com/coryking/FastLED
#include <FastLED.h>        // LED strip control library

class Light
{
public:
  Light();
  void setRGB(uint8_t p_red, uint8_t p_green, uint8_t p_blue);
  void setHSV(uint8_t p_hue, uint8_t p_saturation, uint8_t p_value);
  void setBrightness(uint8_t brightness);
  void setEffect(String effect);

  CRGB getColor();
  uint8_t getBrightness();
  String getEffect();
  String getSupportedEffects();

private:
  CRGB _color;
  uint8_t _brightness;
  String _effect;
  String _effects[];
  // define the array of leds
  CRGB _leds[CONFIG_NUM_LEDS];
};

#endif