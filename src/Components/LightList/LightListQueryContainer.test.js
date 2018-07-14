import React from "react";
import { shallow } from "enzyme";
import LightListQueryContainer from "./LightListQueryContainer";

it("renders without crashing", () => {
    shallow(<LightListQueryContainer />);
});
