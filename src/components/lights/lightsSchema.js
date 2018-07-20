import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import resolvers from "./lightsResolvers";

const typeDefs = importSchema(`${__dirname}/lightsTypeDefs.graphql`);

const schema = makeExecutableSchema({ typeDefs, resolvers });

if (process.env.MOCK) {
  console.log("adding mocks");
  const mocks = require("./lightsMocks");
  addMockFunctionsToSchema({ schema, mocks: mocks.default });
} else {
  console.log("Not adding mocks");
}

export default schema;
