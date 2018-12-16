/*
  Light.cpp - Library for flashing Light code.
  Created by David A. Mellis, November 2, 2007.
  Released into the public domain.
*/

#include "Arduino.h"
#include "Light.h"

//************************************************************************
// Constructor
//************************************************************************
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
}

//************************************************************************
// Setters
//************************************************************************
void Light::setState(boolean stateOn)
{
  _stateOn = stateOn;
  if (stateOn)
  {
    changeColorTo(_color.r, _color.g, _color.b);
  }
  else
  {
    changeColorTo(0, 0, 0);
  }
}

void Light::setBrightness(uint8_t brightness)
{
  _brightness = brightness;
  changeBrightnessTo(brightness);
}

void Light::setColorRGB(uint8_t p_red, uint8_t p_green, uint8_t p_blue)
{
  _stateOn = true;
  _color = CRGB(p_red, p_green, p_blue);
  changeColorTo(p_red, p_green, p_blue); // You must call this before changing the effect for its logic to work
  _effect = NO_EFFECT;
}

void Light::setColorHSV(uint8_t p_hue, uint8_t p_saturation, uint8_t p_value)
{
  _stateOn = true;
  _color = CHSV(p_hue, p_saturation, p_value);
  changeColorTo(_color.r, _color.g, _color.b); // You must call this before changing the effect for its logic to work
  _effect = NO_EFFECT;
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

//************************************************************************
// Getters
//************************************************************************
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

//************************************************************************
// Class Methods
//************************************************************************
void Light::loop(int packetSize, WiFiUDP port)
{
  // Handle color changes
  handleColorChange();

  // Handle Brightness changes
  handleBrightnessChange();

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
    handleVisualize(packetSize, port);
  }
}

void Light::handleVisualize(int packetSize, WiFiUDP port)
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

//************************************************************************
// Light Effects
//************************************************************************
// Sets the light strip to an RGB color
void Light::setRGB(uint8_t p_red, uint8_t p_green, uint8_t p_blue)
{
  CRGB newColor = CRGB(p_red, p_green, p_blue);
  fill_solid(_leds, CONFIG_NUM_LEDS, newColor);
  FastLED.show();
}

// Sets the light strip to an HSV color
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

// Cycles through all hue values on loop
long lastHueCycle = 0;
byte gHue;
void Light::cycleHue()
{
  gHue++;
}

// Determines when the current effect should update
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
int LED = 0;
bool forward = true;
void Light::fadeall()
{
  for (int i = 0; i < CONFIG_NUM_LEDS; i++)
  {
    _leds[i].nscale8(247);
  }
}
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

// Sinelon
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

//************************************************************************
// Crossfade
//************************************************************************
// Color takes 500ms to change no matter what
int transitionSpeed = 510; // In ms, has to be a multiple of 255
uint8_t currentRed = 0;    // Initialized as the initial color defined in the constructor
uint8_t currentGreen = 0;
uint8_t currentBlue = 0;
uint8_t targetRed = 0;
uint8_t targetGreen = 0;
uint8_t targetBlue = 0;
int stepRed = 0;
int stepGreen = 0;
int stepBlue = 0;
boolean startFade = false;
boolean inFade = false;
int currentStep = 0;
int numberOfPossibleColorValues = 255;
int maxColorValue = 255;
int minColorValue = 0;
int totalColorSteps = (maxColorValue - minColorValue) * numberOfPossibleColorValues;

void Light::changeColorTo(uint8_t red, uint8_t green, uint8_t blue)
{
  startFade = true;
  targetRed = red;
  targetGreen = green;
  targetBlue = blue;
}

// TODO: Values between 0 and 255 are always off by 1. Not a big deal but would be nice to fix
unsigned long lastStepTime = 0;
void Light::handleColorChange()
{
  if (startFade)
  {
    // If we are playing an effect, do nothing
    if (_effect != NO_EFFECT && _stateOn)
    {
      return;
    }

    // If the transitions are off, or the light is set to an effect, dont do the transition
    if (transitionSpeed == 0 || _effect != NO_EFFECT)
    {
      setRGB(targetRed, targetGreen, targetBlue);

      currentRed = targetRed;
      currentGreen = targetGreen;
      currentBlue = targetBlue;

      startFade = false;
    }
    // Start the transition
    else
    {
      startFade = false;
      inFade = true;
      currentStep = 0;

      // Calculate the step values
      stepRed = calculateStep(currentRed, targetRed, totalColorSteps);
      stepGreen = calculateStep(currentGreen, targetGreen, totalColorSteps);
      stepBlue = calculateStep(currentBlue, targetBlue, totalColorSteps);
    }
  }

  // If we are currently in the middle of a color change, keep doing the transition
  if (inFade)
  {
    int stepDuration = transitionSpeed / numberOfPossibleColorValues;

    unsigned long now = millis();
    // If its time to take a step
    if (now - lastStepTime > stepDuration)
    {
      lastStepTime = now;

      for (int i = 0; i <= numberOfPossibleColorValues; i++)
      {
        // Calculate the next value to change to
        currentRed = calculateVal(stepRed, currentRed, currentStep, minColorValue, maxColorValue);
        currentGreen = calculateVal(stepGreen, currentGreen, currentStep, minColorValue, maxColorValue);
        currentBlue = calculateVal(stepBlue, currentBlue, currentStep, minColorValue, maxColorValue);
        currentStep++;
      }
      // Set the value and increment the step;
      setRGB(currentRed, currentGreen, currentBlue); // Write current values to LED pins
    }

    // If we have gone through all 255 steps, end the transition
    if (currentStep >= totalColorSteps)
    {
      inFade = false;
      // Serial.println("Ending Fade: ");
      // Serial.printf("Current Red: %i, Current Green: %i, Current Blue: %i\n", currentRed, currentGreen, currentBlue);
      // Serial.printf("target Red: %i, target Green: %i, target Blue: %i\n", targetRed, targetGreen, targetBlue);
    }
  }
}

// Brightness takes 1000ms to change from 0-100%, 500ms to change from 0-50, 250 ms to change from 0-25, etc.unsigned long lastBrightnessStepTime = 0;
int maxBrightnessTransitionTime = 1000;
uint8_t currentBrightness;
uint8_t targetBrightness;
int stepBrightness = 0;
boolean startBrightnessTransition = false;
boolean inBrightnessTransition = false;
int currentBrightnessStep = 0;
int numberOfPossibleBrightnessValues = 100;
int maxBrightnessValue = 100;
int minBrightnessValue = 0;
int totalBrightnessSteps = 1;

void Light::changeBrightnessTo(uint8_t brightness)
{
  startBrightnessTransition = true;
  targetBrightness = brightness;
}

unsigned long lastBrightnessStepTime = 0;
void Light::handleBrightnessChange()
{
  if (startBrightnessTransition)
  {
    // If the lights are off, just set the brightness. Dont need to be fancy
    if (!_stateOn)
    {
      FastLED.setBrightness(map(targetBrightness, 0, 100, 0, CONFIG_MAX_BRIGHTNESS));
      currentBrightness = targetBrightness;

      startBrightnessTransition = false;
    }
    else
    {
      startBrightnessTransition = false;
      inBrightnessTransition = true;
      currentBrightnessStep = 0;
      totalBrightnessSteps = abs(targetBrightness - currentBrightness);
    }

    // Calculate the step values
    stepBrightness = calculateStep(currentBrightness, targetBrightness, totalBrightnessSteps);
  }

  // If we are currently in the middle of a color change, keep doing the transition
  if (inBrightnessTransition)
  {
    int stepDuration = maxBrightnessTransitionTime / numberOfPossibleBrightnessValues;

    unsigned long now = millis();
    // If its time to take a step
    if (now - lastBrightnessStepTime > stepDuration)
    {
      lastBrightnessStepTime = now;

      currentBrightness = calculateVal(stepBrightness, currentBrightness, currentBrightnessStep, minBrightnessValue, maxBrightnessValue);
      currentBrightnessStep++;

      // Set the value and increment the step;
      FastLED.setBrightness(map(currentBrightness, 0, 100, 0, CONFIG_MAX_BRIGHTNESS));
      FastLED.show();
    }

    // If we have gone through all 255 steps, end the transition
    if (currentBrightnessStep >= totalBrightnessSteps)
    {
      inBrightnessTransition = false;
      //Serial.println("Ending Brightness Transition: ");
      //Serial.printf("Current Brightness: %i\n", currentBrightness);
      //Serial.printf("target Brightness: %i\n", targetBrightness);
    }
  }
}

int Light::calculateStep(int prevValue, int endValue, int totalSteps)
{
  int step = endValue - prevValue; // What's the overall gap?
  if (step)
  {                           // If its non-zero,
    step = totalSteps / step; //   divide by 255
  }

  return step;
}

/* The next function is calculateVal. When the loop value, i,
*  reaches the step size appropriate for one of the
*  colors, it increases or decreases the value of that color by 1.
*  (R, G, and B are each calculated separately.)
*/
int Light::calculateVal(int step, int val, int i, int minVal, int maxVal)
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

  // Make sure val stays in the range 0-255
  if (val > maxVal)
  {
    val = maxVal;
  }
  else if (val < minVal)
  {
    val = minVal;
  }

  return val;
}
