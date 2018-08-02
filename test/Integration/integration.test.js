const { getApolloClient } = require("../util/testUtil");
const {
  LIGHT_ADDED,
  LIGHT_REMOVED,
  LIGHTS_CHANGED,
  GET_LIGHTS,
  SET_LIGHT,
  ADD_LIGHT,
  REMOVE_LIGHT
} = require("../util/GraphQLConstants");

beforeAll(() => {});

afterAll(() => {});

beforeEach(() => {});

afterEach(() => {});

const client = getApolloClient();
// These are all API tests
// We need to somehow start the lightapp2 server with mocks
// We need to query those mocks and get back responses
// Use an instance of apollo-client in order to do this
// client = new ApolloClient()
// client.query({query: gql`stuff`})
// https://github.com/apollographql/apollo-client#usage
test("You can add a light", async () => {
  const LIGHT_NAME = "Test Add Light";
  const { data } = await client.mutate({
    mutation: ADD_LIGHT,
    variables: {
      lightId: LIGHT_NAME
    }
  });
  expect(data.addLight).not.toBeNull();
  expect(data.addLight.id).toBe(LIGHT_NAME);
});

test("You can not add a light twice", async () => {
  let addLightError = null;
  const LIGHT_NAME = "Test Add Light Twice";
  await client.mutate({
    mutation: ADD_LIGHT,
    variables: {
      lightId: LIGHT_NAME
    }
  });
  try {
    await client.mutate({
      mutation: ADD_LIGHT,
      variables: {
        lightId: LIGHT_NAME
      }
    });
  } catch (error) {
    addLightError = error;
  }
  expect(addLightError).not.toBeNull;
  expect(addLightError).toBeInstanceOf(Error);
});

test("You can remove a light", async () => {
  const LIGHT_NAME = "Test Remove Light";
  await client.mutate({
    mutation: ADD_LIGHT,
    variables: {
      lightId: LIGHT_NAME
    }
  });
  const { data } = await client.mutate({
    mutation: REMOVE_LIGHT,
    variables: {
      lightId: LIGHT_NAME
    }
  });
  expect(data.removeLight).not.toBeNull();
  expect(data.removeLight.id).toBe(LIGHT_NAME);
});

test("You can not remove a light twice", async () => {
  let removeLightError = null;
  const LIGHT_NAME = "Test Remove Unadded Light";
  try {
    await client.mutate({
      mutation: REMOVE_LIGHT,
      variables: {
        lightId: LIGHT_NAME
      }
    });
  } catch (error) {
    removeLightError = error;
  }
  expect(removeLightError).not.toBeNull;
  expect(removeLightError).toBeInstanceOf(Error);
});

test("You can get an array of all added lights", async () => {
  const LIGHT_NAME1 = "Test Get Lights 1";
  await client.mutate({
    mutation: ADD_LIGHT,
    variables: {
      lightId: LIGHT_NAME1
    }
  });
  const LIGHT_NAME2 = "Test Get Lights 2";
  await client.mutate({
    mutation: ADD_LIGHT,
    variables: {
      lightId: LIGHT_NAME2
    }
  });
  const { data } = await client.query({
    query: GET_LIGHTS
  });
  expect(data.lights).toBeInstanceOf(Array);
  expect(data.lights.find(light => light.id === LIGHT_NAME1)).toBeDefined()
  expect(data.lights.find(light => light.id === LIGHT_NAME2)).toBeDefined()
});

test("You can get one light", async () => {});

test("You can not get a light that was not added", async () => {});

test("You can change a light", async () => {});

test("You can not change a light that was not added", async () => {});

test("You can be notified when a light was added", async () => {});

test("You can be notified when a light was removed", async () => {});

test("You can be notified when a specific light was changed", async () => {});

test("You can be notified when any light was changed", async () => {});
