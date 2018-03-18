import casual from "casual";

const mocks = {
  String: () => "Its a light!",
  Query: () => ({
    light: (root, args) => {
      return { name: args.name };
    }
  }),
  Light: () => ({
    name: () => casual.first_name,
  })
};

export default mocks;
