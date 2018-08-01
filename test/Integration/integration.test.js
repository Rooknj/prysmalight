const { getApolloClient } = require("../testUtil");
beforeAll(() => {});

afterAll(() => {});

beforeEach(() => {});

afterEach(() => {});

const apolloClient = getApolloClient();
// These are all API tests
// We need to somehow start the lightapp2 server with mocks
// We need to query those mocks and get back responses
// Use an instance of apollo-client in order to do this
// client = new ApolloClient()
// client.query({query: gql`stuff`})
// https://github.com/apollographql/apollo-client#usage
test("You can add a light", async () => {});

test("You can not add a light twice", async () => {});

test("You can remove a light", async () => {});

test("You can not remove a light twice", async () => {});

test("You can get an array of all added lights", async () => {});

test("You can get one light", async () => {});

test("You can not get a light that was not added", async () => {});

test("You can change a light", async () => {});

test("You can not change a light that was not added", async () => {});

test("You can be notified when a light was added", async () => {});

test("You can be notified when a light was removed", async () => {});

test("You can be notified when a specific light was changed", async () => {});

test("You can be notified when any light was changed", async () => {});
