"use strict";
const resolversFactory = service => ({
  Query: {
    light: (_, { lightId }) => service.getLight(lightId),
    lights: () => service.getLights(),
    discoveredLights: () => service.getDiscoveredLights()
  },
  Mutation: {
    setLight: (_, { lightId, lightData }) =>
      service.setLight(lightId, lightData),
    addLight: (_, { lightId }) => service.addLight(lightId),
    removeLight: (_, { lightId }) => service.removeLight(lightId),
    updateHub: () => service.updateHub(),
    rebootHub: () => service.rebootHub()
  },
  Subscription: {
    lightChanged: {
      subscribe: (_, { lightId }) => {
        return service.subscribeToLight(lightId);
      }
    },
    lightsChanged: {
      subscribe: () => {
        return service.subscribeToAllLights();
      }
    },
    lightAdded: {
      subscribe: () => {
        return service.subscribeToLightsAdded();
      }
    },
    lightRemoved: {
      subscribe: () => {
        return service.subscribeToLightsRemoved();
      }
    }
  }
});

module.exports = resolversFactory;
