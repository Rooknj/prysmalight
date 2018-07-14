import React from "react";
import { shallow } from "enzyme";
import LightStatus from "./LightStatus";

it("renders without crashing with required props", () => {
    shallow(<LightStatus id="LightStatusTest" />);
});
