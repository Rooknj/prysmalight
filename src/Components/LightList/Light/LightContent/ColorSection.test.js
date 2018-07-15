import React from "react";
import { shallow } from "enzyme";
import ColorSection from "./ColorSection";

it("renders without crashing", () => {
    shallow(<ColorSection />);
});
