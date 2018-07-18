import React from "react";
import { shallow } from "enzyme";
import LightHeader from "./LightHeader";

it("renders without crashing using only required props", () => {
  shallow(<LightHeader id="LightHeaderTest" />);
});
