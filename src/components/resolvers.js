import LightService from "./Light/LightService";
const lightService = new LightService();

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
        return lightService.subscribeLight(lightId);
      }
    },
    lightsChanged: {
      subscribe: _ => {
        return lightService.subscribeAllLights();
      }
    },
    lightAdded: {
      subscribe: _ => {
        return lightService.subscribeLightAdded();
      }
    },
    lightRemoved: {
      subscribe: _ => {
        return lightService.subscribeLightRemoved();
      }
    }
  }
};

export default resolvers;
