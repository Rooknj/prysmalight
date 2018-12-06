const resolversFactory = service => ({
  Query: {
    light: (_, { lightId }) => service.getLight(lightId),
    lights: () => service.getLights()
  },
  Mutation: {
    setLight: (_, { light }) => service.setLight(light),
    addLight: (_, { lightId }) => service.addLight(lightId),
    removeLight: (_, { lightId }) => service.removeLight(lightId)
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
