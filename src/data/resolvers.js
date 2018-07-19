import LightConnector from "./connectors/LightConnector";

const lightConnector = new LightConnector();

const resolvers = {
  Query: {
    light: (_, { lightId }) => lightConnector.getLight(lightId),
    lights: () => lightConnector.getLights()
  },
  Mutation: {
    setLight: (_, { light }) => lightConnector.setLight(light),
    addLight: (_, { lightId }) => lightConnector.addLight(lightId),
    removeLight: (_, { lightId }) => lightConnector.removeLight(lightId)
  },
  Subscription: {
    lightChanged: {
      subscribe: (_, { lightId }) => {
        return lightConnector.subscribeLight(lightId);
      }
    },
    lightsChanged: {
      subscribe: _ => {
        return lightConnector.subscribeAllLights();
      }
    },
    lightAdded: {
      subscribe: _ => {
        return lightConnector.subscribeLightAdded();
      }
    },
    lightRemoved: {
      subscribe: _ => {
        return lightConnector.subscribeLightRemoved();
      }
    }
  }
};

export default resolvers;
