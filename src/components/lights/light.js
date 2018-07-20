// Function to return a new light object with default values
const getNewLight = id => ({
  id,
  connected: 0,
  state: "OFF",
  brightness: 100,
  color: { r: 255, g: 0, b: 0 },
  effect: "None",
  speed: 4,
  supportedEffects: []
});

const findLight = (lightId, lights) => {
  return lights.find(light => light.id === lightId);
};

class Light {
  constructor() {
    // TODO: Get lights from persistent data storage
    // Populate our inMemory Data Store with the light id's
    this.lights = [getNewLight("Light 1")];
  }

  getAllLights() {
    return this.lights;
  }

  getLight(id) {
    return findLight(id, this.lights);
  }

  addLight(id) {
    const newLight = getNewLight(id);
    this.lights.push(newLight);
    return newLight;
  }

  removeLight(id) {
    // Find the index of the light to remove
    const lightToRemove = this.getLight(id);
    const indexToRemove = this.lights.indexOf(lightToRemove);
    // Remove the light from the database
    this.lights.splice(indexToRemove, 1);
    return lightToRemove;
  }
}

export default Light;
