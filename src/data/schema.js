import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import resolvers from "./resolvers";
//import mocks from './mocks';

const typeDefs = importSchema(`${__dirname}/typeDefs.graphql`);

const schema = makeExecutableSchema({ typeDefs, resolvers });

//addMockFunctionsToSchema({ schema, mocks });

export default schema;
