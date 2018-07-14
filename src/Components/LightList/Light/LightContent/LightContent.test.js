import React from "react";
import { shallow } from "enzyme";
import LightContent from "./LightContent";

it("renders without crashing", () => {
    shallow(<LightContent />);
});
