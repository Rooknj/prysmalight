import React from "react";
import { shallow } from "enzyme";
import BrightnessSlider from "./BrightnessSlider";

it("renders without crashing", () => {
  shallow(<BrightnessSlider />);
});
