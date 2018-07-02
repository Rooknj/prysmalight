import { LightConnector } from "./connectors";

const lightConnector = new LightConnector();

const resolvers = {
  Query: {
    light: (_, { lightId }) => lightConnector.getLight(lightId),
    lights: () => lightConnector.getLights()
  },
  Mutation: {
    setLight: (_, { light }) => lightConnector.setLight(light)
  },
  Subscription: {
    lightChanged: {
      subscribe: (_, { lightId }) => {
        return lightConnector.subscribeLight(lightId);
      }
    }
  }
};

export default resolvers;
