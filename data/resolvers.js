import { FortuneCookie, pubsub } from "./connectors";
import { withFilter } from "graphql-subscriptions";

//example data
const lights = [
  {
    id: 1,
    name: "Light 1",
    power: true,
    brightness: 100,
    hue: 23,
    saturation: 51
  },
  {
    id: 2,
    name: "Light 2",
    power: false,
    brightness: 100,
    hue: 23,
    saturation: 51
  }
];

let currId = 3;

const resolvers = {
  Query: {
    getFortuneCookie: () => FortuneCookie.getOne(),
    light: (_, { lightId }) => lights[lightId],
    lights: () => lights
  },
  Mutation: {
    setName: (_, { lightId, name }) => {
      //Find the light in the array of lights
      let light = lights.find(({ id }) => id === lightId);
      //if the light wasnt found
      if (!light) {
        throw new Error(`Couldn't find light with id ${lightId}`);
      }
      //replace old light with new light
      light = Object.assign(light, { name });
      return light;
    },
    setPower: (_, { lightId, power }) => {
      //Find the light in the array of lights
      let light = lights.find(({ id }) => id === lightId);
      //if the light wasnt found
      if (!light) {
        throw new Error(`Couldn't find light with id ${lightId}`);
      }
      //replace old light with new light
      light = Object.assign(light, { power });
      return light;
    },
    setBrightness: (_, { lightId, brightness }) => {
      //Find the light in the array of lights
      let light = lights.find(({ id }) => id === lightId);
      //if the light wasnt found
      if (!light) {
        throw new Error(`Couldn't find light with id ${lightId}`);
      }
      //replace old light with new light
      light = Object.assign(light, { brightness });
      return light;
    },
    setHue: (_, { lightId, hue }) => {
      //Find the light in the array of lights
      let light = lights.find(({ id }) => id === lightId);
      //if the light wasnt found
      if (!light) {
        throw new Error(`Couldn't find light with id ${lightId}`);
      }
      //replace old light with new light
      light = Object.assign(light, { hue });
      return light;
    },
    setSaturation: (_, { lightId, saturation }) => {
      //Find the light in the array of lights
      let light = lights.find(({ id }) => id === lightId);
      //if the light wasnt found
      if (!light) {
        throw new Error(`Couldn't find light with id ${lightId}`);
      }
      //replace old light with new light
      light = Object.assign(light, { saturation });
      return light;
    },
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
