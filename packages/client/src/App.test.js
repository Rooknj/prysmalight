import React from "react";
import { shallow, mount } from "enzyme";
import App from "./App";
import { createSerializer } from "enzyme-to-json";

// Mock out container components so that they will not get rendered while mounting
jest.mock("./Components/LightTool", () => () => (
  <div id="MockLightTool">Mocked Light Tool</div>
));

jest.mock(
  "./Components/LightAppBar/LightActions/LightActionsContainer",
  () => () => (
    <div id="LightActionsContainer">Mocked Light Actions Container</div>
  )
);

jest.mock("./Components/LightAppBar/LightDrawer", () => () => (
  <div id="LightDrawer">Mocked Light Drawer</div>
));

// Add serializer to allow enzyme to create snapshots
expect.addSnapshotSerializer(createSerializer({ mode: "deep" }));

it("renders without crashing", () => {
  shallow(<App />);
});

it("matches shallow snapshot", () => {
  const shallowed = shallow(<App />);
  expect(shallowed).toMatchSnapshot();
});

it("matches mounted snapshot", () => {
  const mounted = mount(<App />);
  expect(mounted).toMatchSnapshot();
});
