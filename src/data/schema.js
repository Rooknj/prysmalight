import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import resolvers from "./resolvers";

const typeDefs = importSchema(`${__dirname}/typeDefs.graphql`);

const schema = makeExecutableSchema({ typeDefs, resolvers });

if (process.env.MOCK) {
  console.log("adding mocks");
  const mocks = require("./mocks");
  console.log(mocks);
  addMockFunctionsToSchema({ schema, mocks: mocks.default });
} else {
  console.log("Not adding mocks");
}

export default schema;
