import { LightConnector } from "./connectors";

const lightConnector = new LightConnector()

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
      resolve: (payload) => payload,
      subscribe: () => lightConnector.subscribeLight("LIGHT_CHANGED_TOPIC")
    }
  }
};

export default resolvers;
