import { FortuneCookie, pubsub } from "./connectors";
import { withFilter } from "graphql-subscriptions";

//example data
const lights = [
  {
    id: 1,
    name: "Light 1",
    power: true,
    brightness: 100,
    color: {
      hue: 120, //ranges 0-360
      saturation: 1, //ranges 0-100%
      lightness: 0.5 //ranges 0-100%
    }
  }
];

let currId = lights.length + 1;

const resolvers = {
  Query: {
    getFortuneCookie: () => FortuneCookie.getOne(),
    light: (_, { lightId }) => lights[lightId],
    lights: () => lights
  },
  Mutation: {
    setLight: (_, { lightId, light }) => {
      let oldlight = lights.find(({ id }) => id === lightId);
      oldlight = Object.assign(oldlight, light);
      pubsub.publish("lightChanged", { lightChanged: oldlight, lightId: lightId }); //push data to subscription
      return lights.find(({ id }) => id === lightId);
    },
    addLight: (_, { newLight }) => {
      let lightToAdd = Object.assign(newLight, {id: currId})
      currId += 1;
      lights.push(lightToAdd);
      pubsub.publish("lightAdded", { lightAdded: lightToAdd }); //push data to subscription
      return lights.find(({ id }) => id === lightToAdd.id);
    }
  },
  Subscription: {
    lightAdded: {
      subscribe: () => pubsub.asyncIterator("lightAdded")
    },
    lightChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("lightChanged"),
        (payload, variables) => {
          console.log(payload.lightId, variables.lightId)
          return payload.lightId === variables.lightId;
        }
      )
    }
  }
};

export default resolvers;
