import LightDAL from "./lightRedisDAL";

const lightdal = new LightDAL();

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

// TODO: Get lights from persistent data storage
// Populate our inMemory Data Store with the light id's
let lightsDB = [getNewLight("Light 1")];

class Light {
  constructor() {}

  getAllLights() {
    lightdal.getAllLights();

    return lightsDB;
  }

  getLight(id) {
    lightdal.getAllLights(id);

    return findLight(id, lightsDB);
  }

  setLight(light) {
    lightdal.setLight(light);
  }

  addLight(id) {
    lightdal.addLight(id);

    const newLight = getNewLight(id);
    lightsDB.push(newLight);
    return newLight;
  }

  removeLight(id) {
    lightdal.removeLight(id);

    // Find the index of the light to remove
    const lightToRemove = this.getLight(id);
    const indexToRemove = lightsDB.indexOf(lightToRemove);
    // Remove the light from the database
    lightsDB.splice(indexToRemove, 1);
    return lightToRemove;
  }
}

export default Light;
