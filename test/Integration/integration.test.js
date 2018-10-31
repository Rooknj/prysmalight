const { getApolloClient } = require("../util/testUtil");
const {
  GET_LIGHT,
  GET_LIGHTS,
  SET_LIGHT,
  ADD_LIGHT,
  REMOVE_LIGHT
} = require("../util/GraphQLConstants");

const client = getApolloClient();

// These are all API tests
// Uses an instance of apollo-client in order to do this
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
  expect(addLightError).not.toBeNull();
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
  expect(removeLightError).not.toBeNull();
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
  expect(data.lights.find(light => light.id === LIGHT_NAME1)).toBeDefined();
  expect(data.lights.find(light => light.id === LIGHT_NAME2)).toBeDefined();
});

test("You can get one light", async () => {
  const LIGHT_NAME = "Test Get Light";
  await client.mutate({
    mutation: ADD_LIGHT,
    variables: {
      lightId: LIGHT_NAME
    }
  });
  const { data } = await client.query({
    query: GET_LIGHT,
    variables: {
      lightId: LIGHT_NAME
    }
  });
  expect(data.light).toBeDefined;
  expect(data.light).not.toBeNull;
  expect(data.light.id).toBe(LIGHT_NAME);
});

test("You can not get a light that was not added", async () => {
  let getLightError = null;
  const LIGHT_NAME = "Test Get Unadded Light";
  try {
    await client.query({
      query: GET_LIGHT,
      variables: {
        lightId: LIGHT_NAME
      }
    });
  } catch (error) {
    getLightError = error;
  }
  expect(getLightError).not.toBeNull();
  expect(getLightError).toBeInstanceOf(Error);
});

test("You can change a light", async () => {
  let data;
  const LIGHT_NAME = "Default Mock"; // This is one of our mock lights we created when spinning up the mock test server
  const LIGHT_STATE = "ON";
  const LIGHT_BRIGHTNESS = 40;
  const LIGHT_COLOR = { r: 3, g: 6, b: 9 };
  const LIGHT_EFFECT = "Test 1";
  const LIGHT_SPEED = 2;

  // Add the mock light
  await client.mutate({
    mutation: ADD_LIGHT,
    variables: {
      lightId: LIGHT_NAME
    }
  });

  // Test changing the state
  ({ data } = await client.mutate({
    mutation: SET_LIGHT,
    variables: {
      light: { id: LIGHT_NAME, state: LIGHT_STATE }
    }
  }));
  expect(data.setLight).toBeDefined();
  expect(data.setLight).not.toBeNull();
  expect(data.setLight.id).toBe(LIGHT_NAME);
  expect(data.setLight.state).toBe(LIGHT_STATE);

  // Test changing the brightness
  ({ data } = await client.mutate({
    mutation: SET_LIGHT,
    variables: {
      light: { id: LIGHT_NAME, brightness: LIGHT_BRIGHTNESS }
    }
  }));
  expect(data.setLight).toBeDefined();
  expect(data.setLight).not.toBeNull();
  expect(data.setLight.id).toBe(LIGHT_NAME);
  expect(data.setLight.brightness).toBe(LIGHT_BRIGHTNESS);

  // Test changing the color
  ({ data } = await client.mutate({
    mutation: SET_LIGHT,
    variables: {
      light: { id: LIGHT_NAME, color: LIGHT_COLOR }
    }
  }));
  expect(data.setLight).toBeDefined();
  expect(data.setLight).not.toBeNull();
  expect(data.setLight.id).toBe(LIGHT_NAME);
  expect(data.setLight.color).toMatchObject(LIGHT_COLOR);

  // Test changing the effect
  ({ data } = await client.mutate({
    mutation: SET_LIGHT,
    variables: {
      light: { id: LIGHT_NAME, effect: LIGHT_EFFECT }
    }
  }));
  expect(data.setLight).toBeDefined();
  expect(data.setLight).not.toBeNull();
  expect(data.setLight.id).toBe(LIGHT_NAME);
  expect(data.setLight.effect).toBe(LIGHT_EFFECT);

  // Test changing the speed
  ({ data } = await client.mutate({
    mutation: SET_LIGHT,
    variables: {
      light: { id: LIGHT_NAME, speed: LIGHT_SPEED }
    }
  }));
  expect(data.setLight).toBeDefined();
  expect(data.setLight).not.toBeNull();
  expect(data.setLight.id).toBe(LIGHT_NAME);
  expect(data.setLight.speed).toBe(LIGHT_SPEED);
});

test("You can not change a light that was not added", async () => {
  let setLightError = null;
  const LIGHT_NAME = "Test Change Not Added"; // This is one of our mock lights we created when spinning up the mock test server
  const LIGHT_BRIGHTNESS = 40;
  try {
    await client.mutate({
      mutation: SET_LIGHT,
      variables: {
        light: { id: LIGHT_NAME, brightness: LIGHT_BRIGHTNESS }
      }
    });
  } catch (error) {
    setLightError = error;
  }
  expect(setLightError).not.toBeNull();
  expect(setLightError).toBeInstanceOf(Error);
});

// TODO: Figure out how to terminate the client.subscription feature