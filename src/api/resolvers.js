const LightService = require("../service/LightService");
const mockService = require("../mock/mockService");

const lightService = process.env.MOCK ? mockService : new LightService();

const resolvers = {
  Query: {
    light: (_, { lightId }) => lightService.getLight(lightId),
    lights: () => lightService.getLights()
  },
  Mutation: {
    setLight: (_, { light }) => lightService.setLight(light),
    addLight: (_, { lightId }) => lightService.addLight(lightId),
    removeLight: (_, { lightId }) => lightService.removeLight(lightId)
  },
  Subscription: {
    lightChanged: {
      subscribe: (_, { lightId }) => {
        return lightService.subscribeToLight(lightId);
      }
    },
    lightsChanged: {
      subscribe: () => {
        return lightService.subscribeToAllLights();
      }
    },
    lightAdded: {
      subscribe: () => {
        return lightService.subscribeToLightsAdded();
      }
    },
    lightRemoved: {
      subscribe: () => {
        return lightService.subscribeToLightsRemoved();
      }
    }
  }
};

module.exports = resolvers;
