import React from "react";
import { shallow } from "enzyme";
import BrightnessSection from "./BrightnessSection";

it("renders without crashing", () => {
  shallow(<BrightnessSection />);
});
