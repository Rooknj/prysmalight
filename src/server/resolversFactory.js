"use strict";
const resolversFactory = (service, repo) => ({
  Query: {
    light: (_, { lightId }) => repo.getLight(lightId),
    lights: () => repo.getLights()
  },
  Mutation: {
    setLight: (_, { lightId, lightData }) => repo.setLight(lightId, lightData),
    addLight: (_, { lightId }) => repo.addLight(lightId),
    removeLight: (_, { lightId }) => repo.removeLight(lightId),
    updateHub: () => service.updateHub(),
    rebootHub: () => service.rebootHub()
  },
  Subscription: {
    lightChanged: {
      subscribe: (_, { lightId }) => {
        return repo.subscribeToLight(lightId);
      }
    },
    lightsChanged: {
      subscribe: () => {
        return repo.subscribeToAllLights();
      }
    },
    lightAdded: {
      subscribe: () => {
        return repo.subscribeToLightsAdded();
      }
    },
    lightRemoved: {
      subscribe: () => {
        return repo.subscribeToLightsRemoved();
      }
    }
  }
});

module.exports = resolversFactory;
