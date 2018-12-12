#include "Light.h"

Light light();

void setup()
{
}

void loop()
{
  light.setRGB(0,0,0);
  delay(1000);                       // wait for a second
  light.setRGB(100,0,0);
  delay(1000); 
  light.setRGB(100,0,0);
}