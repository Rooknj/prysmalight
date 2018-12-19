import React from "react";
import { shallow, mount } from "enzyme";
import LightTool from "./LightTool";
import { createSerializer } from "enzyme-to-json";

// Mock out container components so that they will not get rendered while mounting
jest.mock("./LightList/LightListQueryContainer", () => () => (
  <div id="MockLightListQueryContainer">Mocked Light List Query Container</div>
));

// Add serializer to allow enzyme to create snapshots
expect.addSnapshotSerializer(createSerializer({ mode: "deep" }));

it("renders without crashing", () => {
  shallow(<LightTool />);
});

it("matches shallow snapshot", () => {
  const shallowed = shallow(<LightTool />);
  expect(shallowed).toMatchSnapshot();
});

it("matches mounted snapshot", () => {
  const mounted = mount(<LightTool />);
  expect(mounted).toMatchSnapshot();
});
