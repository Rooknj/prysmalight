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
      r: 120, //ranges 0-360
      g: 1, //ranges 0-100%
      b: 255 //ranges 0-100%
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
      let lightToChange = lights.find(({ id }) => id === lightId);
      lightToChange = Object.assign(lightToChange, light);
      console.log("light: ", light);
      pubsub.publish("CHANGE_LIGHT_TOPIC", light); //send MQTT message to ESP8266
      //pubsub.publish("LIGHT_CHANGED_TOPIC", lightToChange); //Mock response from ESP8266
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
      resolve: (payload, args, context, info) => {
        // Manipulate and return the new value
        return payload;
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator("LIGHT_CHANGED_TOPIC"),
        (payload, variables) => {
          return payload.id === variables.lightId;
        }
      )
    }
  }
};

export default resolvers;
