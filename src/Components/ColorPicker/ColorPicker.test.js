import React from "react";
import { shallow } from "enzyme";
import ColorPicker from "./ColorPicker";

it("renders without crashing", () => {
    shallow(<ColorPicker />);
});
