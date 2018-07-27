import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import resolvers from "./resolvers";
import mocks from "./mocks";
import Debug from "debug";

const debug = Debug("schema");

const typeDefs = importSchema(`${__dirname}/typeDefs.graphql`);

const schema = makeExecutableSchema({ typeDefs, resolvers });

if (process.env.MOCK) {
  debug("adding mocks");
  addMockFunctionsToSchema({ schema, mocks });
} else {
  debug("Not adding mocks");
}

export default schema;
