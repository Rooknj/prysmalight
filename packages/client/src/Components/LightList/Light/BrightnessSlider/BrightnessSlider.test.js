import React from "react";
import { shallow } from "enzyme";
import BrightnessSlider from "./BrightnessSlider.test";

it("renders without crashing", () => {
  shallow(<BrightnessSlider />);
});
