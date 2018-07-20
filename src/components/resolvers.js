import LightsController from "./lights/lightsController";

const lightsController = new LightsController();

const resolvers = {
  Query: {
    light: (_, { lightId }) => lightsController.getLight(lightId),
    lights: () => lightsController.getLights()
  },
  Mutation: {
    setLight: (_, { light }) => lightsController.setLight(light),
    addLight: (_, { lightId }) => lightsController.addLight(lightId),
    removeLight: (_, { lightId }) => lightsController.removeLight(lightId)
  },
  Subscription: {
    lightChanged: {
      subscribe: (_, { lightId }) => {
        return lightsController.subscribeLight(lightId);
      }
    },
    lightsChanged: {
      subscribe: _ => {
        return lightsController.subscribeAllLights();
      }
    },
    lightAdded: {
      subscribe: _ => {
        return lightsController.subscribeLightAdded();
      }
    },
    lightRemoved: {
      subscribe: _ => {
        return lightsController.subscribeLightRemoved();
      }
    }
  }
};

export default resolvers;
