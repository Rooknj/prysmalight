import React from "react";
import { shallow } from "enzyme";
import LightStateContainer from "./LightStateContainer";

it("renders without crashing", () => {
    shallow(<LightStateContainer />);
});
