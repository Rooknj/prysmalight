import { makeExecutableSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import resolvers from "./resolvers";
import Debug from "debug";

const debug = Debug("schema");

const typeDefs = importSchema(`${__dirname}/typeDefs.graphql`);

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
