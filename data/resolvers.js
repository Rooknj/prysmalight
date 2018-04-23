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
      resolve: (payload, args, context, info) => {
        console.log(payload)
        console.log(args)
        console.log(context)
        return {id: "Light 1"}
      },
      subscribe: () => lightConnector.subscribeLight()
    }
  }
};

export default resolvers;
