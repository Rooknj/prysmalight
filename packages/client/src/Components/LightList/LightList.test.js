import React from "react";
import { shallow, mount } from "enzyme";
import LightList from "./LightList";
import { createSerializer } from "enzyme-to-json";

// Mock out container components so that they will not get rendered while mounting
jest.mock("./Light/LightMutationContainer", () => () => (
  <div id="MockLightMutationContainer">Mocked Light Mutation Container</div>
));

// Add serializer to allow enzyme to create snapshots
expect.addSnapshotSerializer(createSerializer({ mode: "deep" }));

// TODO: Test rendering with actual mock lights
it("renders without crashing", () => {
  shallow(<LightList />);
});

it("matches shallow snapshot", () => {
  const shallowed = shallow(<LightList />);
  expect(shallowed).toMatchSnapshot();
});

it("matches mounted snapshot", () => {
  const mounted = mount(<LightList />);
  expect(mounted).toMatchSnapshot();
});
