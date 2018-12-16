const mockLight = {
  id: "Mock Service Light 1",
  connected: true,
  state: "ON",
  brightness: 72,
  color: { r: 0, g: 127, b: 255 },
  effect: "None",
  speed: 3,
  supportedEffects: ["Effect 1", "Effect 2", "Effect 3"]
};

const getLight = () => mockLight;
const getLights = () => [mockLight, mockLight, mockLight];
const setLight = () => mockLight;
const addLight = () => mockLight;
const removeLight = () => mockLight;

module.exports = {
  getLight,
  getLights,
  setLight,
  addLight,
  removeLight
};
