import React from "react";
import { shallow } from "enzyme";
import EffectSection from "./EffectSection";

it("renders without crashing", () => {
    shallow(<EffectSection />);
});
