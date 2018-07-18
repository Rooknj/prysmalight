import React from "react";
import { shallow } from "enzyme";
import LightTool from "./LightTool";

it("renders without crashing", () => {
  shallow(<LightTool />);
});
