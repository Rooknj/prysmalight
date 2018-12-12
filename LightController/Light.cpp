/*
  Light.cpp - Library for flashing Light code.
  Created by David A. Mellis, November 2, 2007.
  Released into the public domain.
*/

#include "Arduino.h"
#include "Light.h"

#include "ESP8266WiFi.h" // ESP8266 Core WiFi Library
#include "WiFiUdp.h"
WiFiUDP port;

Light::Light()
{
  // Set Serial Communication rate
  if (CONFIG_DEBUG)
  {
    // For some reason you can not call this inside LightController.ino or the FastLED DMA will not work
    // TODO: Figure out why
    Serial.begin(115200); 
  }
  FastLED.addLeds<CONFIG_CHIPSET, CONFIG_DATA_PIN, CONFIG_COLOR_ORDER>(_leds, CONFIG_NUM_LEDS);
  _stateOn = false;
  _brightness = 100;
  _color = CRGB(255, 0, 0);
  _effect = NO_EFFECT;
  _effectSpeed = 4;
  port.begin(_UDP_PORT);
}

// ************************************************************************
// Setters
// ************************************************************************
void Light::setState(boolean stateOn)
{
  _stateOn = stateOn;
  if (stateOn)
  {
    setRGB(_color.r, _color.g, _color.b);
  }
  else
  {
    setRGB(0, 0, 0);
  }
}

void Light::setBrightness(uint8_t brightness)
{
  _brightness = brightness;
  FastLED.setBrightness(map(brightness, 0, 100, 0, CONFIG_MAX_BRIGHTNESS));
  FastLED.show();
}

void Light::setColorRGB(uint8_t p_red, uint8_t p_green, uint8_t p_blue)
{
  _stateOn = true;
  _color = CRGB(p_red, p_green, p_blue);
  _effect = NO_EFFECT;
  setRGB(p_red, p_green, p_blue);
}

void Light::setColorHSV(uint8_t p_hue, uint8_t p_saturation, uint8_t p_value)
{
  _stateOn = true;
  _color = CHSV(p_hue, p_saturation, p_value);
  _effect = NO_EFFECT;
  setHSV(p_hue, p_saturation, p_value);
}

void Light::setEffect(String effect)
{
  _stateOn = true;
  _color = CRGB(0, 0, 0);
  _effect = effect;
  setRGB(0, 0, 0);
}

void Light::setEffectSpeed(int effectSpeed)
{
  _effectSpeed = effectSpeed;
}

// ************************************************************************
// Getters
// ************************************************************************
boolean Light::getState()
{
  return _stateOn;
}

uint8_t Light::getBrightness()
{
  return _brightness;
}

CRGB Light::getColor()
{
  return _color;
}

String Light::getEffect()
{
  return _effect;
}

int Light::getEffectSpeed()
{
  return _effectSpeed;
}

char **Light::getEffects()
{
  return _effects;
}

int Light::getNumEffects()
{
  return _numEffects;
}

int Light::getUdpPort()
{
  return _UDP_PORT;
}

// ************************************************************************
// Class Methods
// ************************************************************************
void Light::playEffect()
{
  // Handle reading visualization data
  int packetSize = port.parsePacket(); // Read data over socket

  // Handle the current effect
  if (_effect == NO_EFFECT || _stateOn == false)
  { // Change to add effect
    // do nothing
  }
  else if (_effect == "Flash")
  {
    handleFlash();
  }
  else if (_effect == "Fade")
  {
    handleFade();
  }
  else if (_effect == "Rainbow")
  {
    handleRainbow();
  }
  else if (_effect == "Confetti")
  {
    handleConfetti();
  }
  else if (_effect == "Cylon")
  {
    handleCylon();
  }
  else if (_effect == "Juggle")
  {
    handleJuggle();
  }
  else if (_effect == "BPM")
  {
    handleBPM();
  }
  else if (_effect == "Sinelon")
  {
    handleSinelon();
  }
  else if (_effect == "Visualize")
  {
    handleVisualize(packetSize);
  }
}

// ************************************************************************
// Private functions
// ************************************************************************
void Light::setRGB(uint8_t p_red, uint8_t p_green, uint8_t p_blue)
{
  CRGB newColor = CRGB(p_red, p_green, p_blue);
  fill_solid(_leds, CONFIG_NUM_LEDS, newColor);
  FastLED.show();
}

void Light::setHSV(uint8_t p_hue, uint8_t p_saturation, uint8_t p_value)
{
  CRGB newColor = CHSV(p_hue, p_saturation, p_value);
  fill_solid(_leds, CONFIG_NUM_LEDS, newColor);
  FastLED.show();
}

int Light::getFlashSpeed()
{
  switch (_effectSpeed)
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

int Light::getCycleSpeed()
{
  switch (_effectSpeed)
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
byte gHue;
void Light::cycleHue()
{
  gHue++;
}

long lastUpdate = 0;
bool Light::shouldUpdate()
{
  long updateThreshold;
  if (_effect == "Flash")
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
byte flash_index = 0;
void Light::handleFlash()
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
void Light::handleFade()
{
  if (shouldUpdate())
  {
    cycleHue();
    setHSV(gHue, 255, 255);
  }
}

// Rainbow
void Light::handleRainbow()
{
  if (shouldUpdate())
  {
    cycleHue();
    fill_rainbow(_leds, CONFIG_NUM_LEDS, gHue, 7);
    FastLED.show();
  }
}

// Confetti
void Light::handleConfetti()
{
  if (shouldUpdate())
  {
    cycleHue();
    fadeToBlackBy(_leds, CONFIG_NUM_LEDS, 10);
    int pos = random16(CONFIG_NUM_LEDS);
    _leds[pos] += CHSV(gHue + random8(64), 200, 255);
    FastLED.show();
  }
}

// Cylon
void Light::fadeall()
{
  for (int i = 0; i < CONFIG_NUM_LEDS; i++)
  {
    _leds[i].nscale8(247);
  }
}

int LED = 0;
bool forward = true;
void Light::handleCylon()
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
    _leds[LED] = CHSV(gHue, 255, 255);
    FastLED.show();
  }
}

// Juggle
void Light::handleJuggle()
{
  if (shouldUpdate())
  {
    // eight colored dots, weaving in and out of sync with each other
    fadeToBlackBy(_leds, CONFIG_NUM_LEDS, 20);
    byte dothue = 0;
    for (int i = 0; i < 8; i++)
    {
      _leds[beatsin16(i + 7, 0, CONFIG_NUM_LEDS - 1)] |= CHSV(dothue, 200, 255);
      dothue += 32;
    }
    FastLED.show();
  }
}

// BPM
int Light::getBPM()
{
  switch (_effectSpeed)
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

void Light::handleBPM()
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
      _leds[i] = ColorFromPalette(palette, gHue + (i * 2), beat - gHue + (i * 10));
    }
    FastLED.show();
  }
}

void Light::handleSinelon()
{
  if (shouldUpdate())
  {
    cycleHue();
    fadeToBlackBy(_leds, CONFIG_NUM_LEDS, 20);
    int pos = beatsin16((int)(getBPM() / 5), 0, CONFIG_NUM_LEDS - 1);
    _leds[pos] += CHSV(gHue, 255, 192);
    FastLED.show();
  }
}

void Light::handleVisualize(int packetSize)
{
  if (packetSize == sizeof(_leds))
  {
    port.read((char *)_leds, sizeof(_leds));
    FastLED.show();
  }
  else if (packetSize)
  {
    Serial.printf("Invalid packet size: %u (expected %u)\n", packetSize, sizeof(_leds));
    port.flush();
    return;
  }
}

/************ Crossfade transition function ******************/
/*
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
      light.setColorRGB(realRed, realGreen, realBlue);

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

        light.setColorRGB(redVal, grnVal, bluVal); // Write current values to LED pins

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
*/

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
