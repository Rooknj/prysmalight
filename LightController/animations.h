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