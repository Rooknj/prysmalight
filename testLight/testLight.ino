#include "Light.h"

Light light;

void setup()
{
  Serial.begin(115200);
  Serial.println("Starting");
  light.setBrightness(10);
  light.setEffect("Flash");
  light.setEffectSpeed(7);
  light.setState(false);
}

void loop()
{
  light.playEffect();
}