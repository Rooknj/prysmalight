import React from "react";
import { shallow } from "enzyme";
import LightList from "./LightList";

it("renders without crashing", () => {
  shallow(<LightList />);
});
