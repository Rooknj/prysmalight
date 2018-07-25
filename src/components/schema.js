import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import resolvers from "./resolvers";
import Debug from "debug";

const debug = Debug("schema");

const typeDefs = importSchema(`${__dirname}/typeDefs.graphql`);

const schema = makeExecutableSchema({ typeDefs, resolvers });

if (process.env.MOCK) {
  debug("adding mocks");
  const mocks = require("./mocks");
  addMockFunctionsToSchema({ schema, mocks: mocks.default });
} else {
  debug("Not adding mocks");
}

export default schema;
