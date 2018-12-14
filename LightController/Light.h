/*
  Light.h - Library for flashing Light code.
  Created by David A. Mellis, November 2, 2007.
  Released into the public domain.
*/
#ifndef Light_h
#define Light_h

#include "Arduino.h"
#include "config.h"
#define FASTLED_INTERNAL
#define FASTLED_ESP8266_DMA // better control for ESP8266 will output or RX pin requires fork https://github.com/coryking/FastLED
#include "FastLED.h"        // LED strip control library

#include "WiFiUdp.h"

#define NO_EFFECT "None"

class Light
{
public:
  Light();
  void setState(boolean stateOn);
  void setBrightness(uint8_t brightness);
  void setColorRGB(uint8_t p_red, uint8_t p_green, uint8_t p_blue);
  void setColorHSV(uint8_t p_hue, uint8_t p_saturation, uint8_t p_value);
  void setEffect(String effect);
  void setEffectSpeed(int effectSpeed);

  boolean getState();
  uint8_t getBrightness();
  CRGB getColor();
  String getEffect();
  int getEffectSpeed();
  char **getEffects();
  int getNumEffects();

  void loop(int packetSize, WiFiUDP port);

private:
  // Variables with getters
  boolean _stateOn;
  uint8_t _brightness;
  CRGB _color;
  String _effect;
  int _effectSpeed;
  int _numEffects = 9;
  char *_effects[9] = {"Flash", "Fade", "Rainbow", "Cylon", "Sinelon", "Confetti", "BPM", "Juggle", "Visualize"}; // Change to add effect
  CRGB _leds[CONFIG_NUM_LEDS];

  // Private functions
  void setRGB(uint8_t p_red, uint8_t p_green, uint8_t p_blue);
  void setHSV(uint8_t p_hue, uint8_t p_saturation, uint8_t p_value);

  // Animation helpers
  int getFlashSpeed();
  int getCycleSpeed();
  void cycleHue();
  bool shouldUpdate();
  void fadeall();
  int getBPM();

  // Animation functions
  void handleFlash();
  void handleFade();
  void handleRainbow();
  void handleConfetti();
  void handleCylon();
  void handleJuggle();
  void handleBPM();
  void handleSinelon();
  void handleVisualize(int packetSize, WiFiUDP port);

  // Color/Brightness transition functions
  void changeColorTo(uint8_t red, uint8_t green, uint8_t blue);
  void handleColorChange();
  void handleBrightnessChange();
  int calculateStep(int prevValue, int endValue, int totalSteps);
  int calculateVal(int step, int val, int i, int minVal, int maxVal);
};

#endif