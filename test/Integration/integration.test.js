import MockLight from "../../src/components/LightService/Mocks/MockLight";
import LightService from "../../src/components/LightService/LightService";

let lightService, mockLight;
const TEST_ID = "Integration Light";

beforeAll(async () => {
  // // Keep this here?
  // lightService = new LightService();
  // mockLight = new MockLight(TEST_ID);
  // const promise1 = mockLight.subscribeToCommands();
  // const promise2 = mockLight.publishConnected({ name: TEST_ID, connection: 2 });
  // const promise3 = mockLight.publishEffectList({
  //   name: TEST_ID,
  //   effectList: ["Test 1", "Test 2", "Test 3"]
  // });
  // const promise4 = mockLight.publishState({
  //   name: TEST_ID,
  //   state: "OFF",
  //   color: { r: 255, g: 100, b: 0 },
  //   brightness: 100,
  //   effect: "None",
  //   speed: 4
  // });

  // await Promise.all([promise1, promise2, promise3, promise4]);
});

afterAll(() => {
  // clear db?
});

beforeEach(() => {
  // Initialize the redis DB
});

afterEach(() => {
  // Clear the redis DB
});

// These are all the high level test cases. Test all errors and branch statements in the unit tests
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


