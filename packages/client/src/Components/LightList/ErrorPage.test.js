import React from "react";
import { shallow, mount } from "enzyme";
import ErrorPage from "./ErrorPage";
import { createSerializer } from "enzyme-to-json";
// Add serializer to allow enzyme to create snapshots
expect.addSnapshotSerializer(createSerializer({ mode: "deep" }));
// TODO: Test rendering with actual mock lights
it("renders without crashing", () => {
  shallow(<ErrorPage />);
});
it("matches shallow snapshot", () => {
  const shallowed = shallow(<ErrorPage />);
  expect(shallowed).toMatchSnapshot();
});
it("matches mounted snapshot", () => {
  const mounted = mount(<ErrorPage />);
  expect(mounted).toMatchSnapshot();
});
