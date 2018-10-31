const resolversFactory = repo => ({
  Query: {
    light: (_, { lightId }) => repo.getLight(lightId),
    lights: () => repo.getLights()
  },
  Mutation: {
    setLight: (_, { light }) => repo.setLight(light),
    addLight: (_, { lightId }) => repo.addLight(lightId),
    removeLight: (_, { lightId }) => repo.removeLight(lightId)
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
