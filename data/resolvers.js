import { FortuneCookie } from "./connectors";

const resolvers = {
  Query: {
    getFortuneCookie() {
      return FortuneCookie.getOne();
    },
    light(_, args) {
      return {
        id: 1,
        name: "Light 1",
        power: true,
        brightness: 100,
        hue: 23,
        saturation: 51
      };
    }
  }
};

export default resolvers;
