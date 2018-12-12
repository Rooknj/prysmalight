/*
  Morse.cpp - Library for flashing Morse code.
  Created by David A. Mellis, November 2, 2007.
  Released into the public domain.
*/

#include "Arduino.h"
#include "Light.h"

Light::Light()
{
  // init FastLED and the LED strip
  _color = CRGB(0, 0, 0);
  _brightness = 100;
  FastLED.addLeds<CONFIG_CHIPSET, CONFIG_DATA_PIN, CONFIG_COLOR_ORDER>(_leds, CONFIG_NUM_LEDS);
  FastLED.setBrightness(map(_brightness, 0, 100, 0, CONFIG_MAX_BRIGHTNESS));
  setRGB(0, 0, 0);
}

void Light::setRGB(uint8_t p_red, uint8_t p_green, uint8_t p_blue)
{
  fill_solid(_leds, CONFIG_NUM_LEDS, CRGB(p_red, p_green, p_blue));
  FastLED.show();
}

CRGB Light::getColor()
{
  return _color;
}