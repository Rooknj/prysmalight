import React from "react";
import { shallow } from "enzyme";
import Light from "./Light";

it("renders without crashing", () => {
    shallow(<Light />);
});
