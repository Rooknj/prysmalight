"use strict";
const resolvers = {
  Query: {
    light: (_, { lightId }, { lightService }) => lightService.getLight(lightId),
    lights: (_, args, { lightService }) => lightService.getLights(),
    discoveredLights: (_, args, { lightService }) =>
      lightService.getDiscoveredLights()
  },
  Mutation: {
    setLight: (_, { lightId, lightData }, { lightService }) =>
      lightService.setLight(lightId, lightData),
    addLight: (_, { lightId }, { lightService }) =>
      lightService.addLight(lightId),
    removeLight: (_, { lightId }, { lightService }) =>
      lightService.removeLight(lightId),
    updateHub: (_, args, { lightService }) => lightService.updateHub(),
    rebootHub: (_, args, { lightService }) => lightService.rebootHub()
  },
  Subscription: {
    lightChanged: {
      subscribe: (_, { lightId }, { lightService }) => {
        return lightService.subscribeToLight(lightId);
      }
    },
    lightsChanged: {
      subscribe: (_, args, { lightService }) => {
        return lightService.subscribeToAllLights();
      }
    },
    lightAdded: {
      subscribe: (_, args, { lightService }) => {
        return lightService.subscribeToLightsAdded();
      }
    },
    lightRemoved: {
      subscribe: (_, args, { lightService }) => {
        return lightService.subscribeToLightsRemoved();
      }
    }
  }
};

module.exports = resolvers;