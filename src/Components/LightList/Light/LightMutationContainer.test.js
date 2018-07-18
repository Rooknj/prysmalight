import React from "react";
import { shallow } from "enzyme";
import LightMutationContainer from "./LightMutationContainer";

it("renders without crashing", () => {
  shallow(<LightMutationContainer />);
});
